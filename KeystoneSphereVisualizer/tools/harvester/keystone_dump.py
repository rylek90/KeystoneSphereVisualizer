import sys
from bs4 import BeautifulSoup
import urllib2
import time
import pytumblr
import fileinput
import sys
import os
from xml.etree.ElementTree import Element, SubElement, Comment, tostring, dump
from bs4 import BeautifulSoup
import urllib2

base_url = 'http://www.keystone-cost.eu/keystone/'
file_path = 'D:\\keystone\\'
img_path = 'D:\\keystone\\img\\'
work_group_range = range(1,5)

def getcontent(request_url):
	print "getcontent(" + request_url + ")"
	full_file_path = file_path + request_url.replace("/", "_")
	if os.path.exists(full_file_path):
		f = open(full_file_path, 'rb')
		content = f.read()
		f.close()
		return content
	else:
		url = base_url + request_url
		response = urllib2.urlopen(url)
		file = open(full_file_path, 'wb')
		content = response.read()
		file.write(content)
		file.close()
		return content

def get_members_from_content(content):
	print "get_members_from_content(...)"
	soup = BeautifulSoup(content)
	members_li = soup.select('div#memberslist li')
	members = []
	for member_li in members_li:
		try:
			divs = member_li.find_all('div')
			print divs[0]
			a = divs[0].find_all('a')[0]
			name = a.text.encode('utf-8')
			members.append({'name' : name});
		except Exception as e:
			print "Exception for member_li:"
			print member_li
			print "Exception value:"
			print e
	return members

def get_members_from_members_site(content):
	print "get_members_from_content(...)"
	soup = BeautifulSoup(content)
	members_li = soup.select('div#memberslist li')
	members = []
	for member_li in members_li:
		#try:
		if(True):
			divs = member_li.find_all('div')
			img = member_li.find_all('img')[0]['src']
			print img
			a = divs[1].find_all('a')[0]
			href = a['href']
			print href
			name = a.text.encode('utf-8')
			print name
			print 'Country: '
			print '   A:' + str(divs[1].find_all('br'))
			print '   A[0]:' + str(divs[1].find_all('br')[0])
			print '   text:' + str(divs[1].find_all('br')[0].text)
			country = divs[1].find_all('br')[0].text.replace("\"\"", "")
			img_name = (a.text.replace(" ", "") + '.png').encode('ascii', 'ignore')
			check_image(img, img_name)
			members.append({'img_src' : '/img/'+img_name, 'href' : href, 'name' : name, 'country' : country});
		#except Exception as e:
		#	print "Exception for member_li:"
		#	print member_li
		#	print "Exception value:"
		#	print e
	return members
	
def check_image(url, name):
	print "checkImage(" + url + ")"
	full_file_path = img_path + name
	if os.path.exists(full_file_path):
		print "\tImage already there"
		return
	else:
		print "\tDownload image"
		try:
			response = urllib2.urlopen(url)
			f = open(full_file_path, 'wb')
			f.write(response.read())
			f.close()
		except Exception as e:
			print '\tError while downloading a file'
			print e

print "Get members content"
members_content = getcontent('members/')
all_members = get_members_from_members_site(members_content)
print "Get work_groups content"
work_group_members = {}
for i in work_group_range:
	cont = getcontent('work-group/wg'+str(i)+'/')
	work_group_members[i] = get_members_from_content(cont)
	
print "Get expertises list"
#parsing
soup = BeautifulSoup(members_content)
expertises = {}
print "Looking for expertises"
expertises_obj = soup.select('div.cat-list-filter')[1]
expertises_as = expertises_obj.find_all('a')
for expertise_a in expertises_as:
	print 'Expertise found:'
	print expertise_a
	expertise_name = expertise_a.text
	print expertise_name
	expertise_href = expertise_a['href']
	print expertise_href
	expertises[expertise_name] = expertise_href
#get all expertises

expertises_members = {}
print 'All expertises x members'
for expertise_key in expertises:
	expertise_href = expertises[expertise_key]
	print "Exp. key:"
	print expertise_key
	print "Exp. value:"
	print expertise_href
	if(expertise_href == None): #work groups(?)
		print 'Expertise href == None'
		continue
	expertise_content = getcontent(expertise_href.replace(base_url, ""))
	temp_memb = get_members_from_content(expertise_content)
	expertises_members[expertise_key] = temp_memb

#all_members - vector of dicts, expertises_members - dict of dicts, work_group - vector of vectors
print "PRINT ALL MEMBERS WITH INFORMATIONS"
id = 1
for member in all_members:
	print str(id) + '     NEXT MEMBER****'
	print 'Name: ' + member['name']
	print 'Image Url: ' + member['img_src']
	print 'More info Url: ' + member['href']
	print 'Country: ' + member['country']
	print 'Work groups: '
	for i in work_group_range:
		for member_wg in work_group_members[i]:
			if(member_wg['name'] == member['name']):
				print '\t Work group ' + str(i)
	print 'Expertises: '
	for expertise_key in expertises_members:
		expertise_value = expertises_members[expertise_key]
		if(expertise_value == None):
			continue
		members_in_expertise = expertise_value
		for member_in_expertise in members_in_expertise:
			if(member_in_expertise['name'] == member['name']):
				print '\t' + expertise_key
	id = id + 1
	
print "SAVE ALL MEMBERS TO FILE"
root = Element('root')
people = SubElement(root, 'people')
for member in all_members:
	attrs = {'name' : member['name'].decode('utf-8'), 'img_src' : member['img_src'], 'href' : member['href'], 'country' : member['country']}
	person = SubElement(people, 'person', attrs)
	
	work_groups = SubElement(person, 'workgroups')
	for i in work_group_range:
		for member_wg in work_group_members[i]:
			if(member_wg['name'] == member['name']):
				work_group = SubElement(work_groups, 'workgroup', {'id' : str(i)})
	expertises = SubElement(person, 'expertises')			
	expr_id = 1
	for expertise_key in expertises_members:
		expertise_value = expertises_members[expertise_key]
		if(expertise_value == None):
			continue
		members_in_expertise = expertise_value
		for member_in_expertise in members_in_expertise:
			if(member_in_expertise['name'] == member['name']):
				expertise = SubElement(expertises, 'expertise', {'id' : str(expr_id)})
				#print '\t' + expertise_key
		expr_id = expr_id +1
	id = id + 1
#save expertises
expertises = SubElement(root, 'expertises')
expertise_id = 1
for expertise_key in expertises_members:
	expertise = SubElement(expertises, 'expertise', {'id' : str(expertise_id)})
	#set value
	expertise.text = expertise_key #(?)
	expertise_id = expertise_id + 1
f = open('keystone.xml', 'w')
#dump(root)
#print tostring(root)
f.write(tostring(root))
f.close()