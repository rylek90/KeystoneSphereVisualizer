﻿
var ScientistManager = function() {

    this.Selectors = {
        Url: '.js-url',
        ImageSource: '.js-image-source',
        Name: '.js-name',
        Countries: '.js-countries',
        Workgroups: '.js-workgroups',
        Entities: '.js-entities',
        Expertises: '.js-expertises'
    };
    var resolveValue = this.ResolveValue;

    ScientistManager.prototype.postData = function() {
        var url = this.ResolveValue(this.Selectors.Url);
        var name = this.ResolveValue(this.Selectors.Name);
        var imgSrc = this.ResolveValue(this.Selectors.ImageSource);

        var country = this.ResolveValue(this.Selectors.Countries);
        var workgroup = this.ResolveValue(this.Selectors.Workgroups);
        var entity = this.ResolveValue(this.Selectors.Entities);
        var expertises = this.ResolveValue(this.Selectors.Expertises);

        var dataToPost = {
            url: url,
            name: name,
            imgSrc: imgSrc,
            country: country,
            workgroup: workgroup,
            entity: entity,
            expertises: expertises
        };

        $.ajax({
            type: "POST",
            url: "/postData",
            data: dataToPost,
            success: function(data) {
                document.location = '/public/new.xml';
            }
        });
    };

    this.ResolveValue = function(selector) {
        return $(selector).val();
    };

}