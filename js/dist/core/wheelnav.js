﻿///#source 1 1 /js/source/wheelnav.core.js
/* ======================================================================================= */
/*                                   wheelnav.js - v1.5.6                                  */
/* ======================================================================================= */
/* This is a small JavaScript library for animated SVG based wheel navigation.             */
/* Requires Raphaël JavaScript Vector Library (http://raphaeljs.com)                       */
/* ======================================================================================= */
/* Check http://wheelnavjs.softwaretailoring.net for samples.                              */
/* Fork https://github.com/softwaretailoring/wheelnav for contribution.                    */
/* ======================================================================================= */
/* Copyright © 2014-2015 Gábor Berkesi (http://softwaretailoring.net)                      */
/* Licensed under MIT (https://github.com/softwaretailoring/wheelnav/blob/master/LICENSE)  */
/* ======================================================================================= */

/* ======================================================================================= */
/* Documentation: http://wheelnavjs.softwaretailoring.net/documentation/core.html          */
/* ======================================================================================= */

wheelnav = function (divId, raphael, divWidth, divHeight) {

    this.holderId = "wheel";

    if (divId !== undefined &&
        divId !== null) {
        this.holderId = divId;
    }

    var holderDiv = document.getElementById(divId);

    if ((holderDiv === null ||
        holderDiv === undefined) &&
        (raphael === undefined ||
        raphael === null)) {
        return this;
    }
    
    //Prepare raphael object and set the width
    var canvasWidth;
    var clearContent = true;

    if (raphael === undefined ||
        raphael === null) {

        var removeChildrens = [];
        for (var i = 0; i < holderDiv.children.length; i++) {
            if (holderDiv.children[i].localName === "svg") {
                removeChildrens.push(holderDiv.children[i]);
            }
        }

        for (var i = 0; i < removeChildrens.length; i++) {
            holderDiv.removeChild(removeChildrens[i]);
        }

        if (divWidth !== undefined &&
            divWidth !== null) {
            if (divHeight === undefined ||
                divHeight === null) {
                divHeight = divWidth;
            }
            this.raphael = new Raphael(divId, divWidth, divHeight);
            canvasWidth = divWidth;
        }
        else {
            this.raphael = new Raphael(divId);
            canvasWidth = holderDiv.clientWidth;
        }

        this.raphael.setViewBox(0, 0, this.raphael.width, this.raphael.height, true);
    }
    else {
        //The divId parameter has to be the identifier of the wheelnav in this case.
        this.raphael = raphael;
        canvasWidth = this.raphael.width;
        clearContent = false;
    }

    //Public properties
    this.centerX = canvasWidth / 2;
    this.centerY = canvasWidth / 2;
    this.wheelRadius = canvasWidth / 2;
    this.navAngle = 0;
    this.sliceAngle = null;
    this.titleRotateAngle = null;
    this.initTitleRotate = false;
    this.clickModeRotate = true;
    this.rotateRound = false;
    this.rotateRoundCount = 0;
    this.clickModeSpreadOff = false;
    this.animatetimeCalculated = false; // In clickModeRotate, when animatetimeCalculated is true, the navItem.animatetime calculated by wheelnav.animatetime and current rotationAngle. In this case, the wheelnav.animatetime belongs to the full rotation.
    this.animateRepeatCount = 0;
    this.clockwise = true;
    this.multiSelect = false;
    this.hoverPercent = 1;
    this.selectedPercent = 1;
    this.clickablePercentMin = 0;
    this.clickablePercentMax = 1;
    this.currentPercent = null;
    this.cssMode = false;
    this.selectedToFront = true;

    this.navItemCount = 0;
    this.navItemCountLabeled = false;
    this.navItemCountLabelOffset = 0;
    this.navItems = [];
    this.navItemsEnabled = true;
    this.animateFinishFunction = null;

    // These settings are useful when navItem.sliceAngle < 360 / this.navItemCount
    this.navItemsContinuous = false; 
    this.navItemsCentered = true; // This is reasoned when this.navItemsContinuous = false;

    this.colors = colorpalette.defaultpalette;
    this.titleSpreadScale = null;

    //Spreader settings
    this.spreaderEnable = false;
    this.spreaderRadius = 20;
    this.spreaderStartAngle = 0;
    this.spreaderSliceAngle = 360;
    this.spreaderPathFunction = spreaderPath().PieSpreader;
    this.spreaderPathCustom = null;
    this.spreaderInPercent = 1;
    this.spreaderOutPercent = 1;
    this.spreaderInTitle = "+";
    this.spreaderOutTitle = "-";
    this.spreaderTitleFont = null;
    this.spreaderPathInAttr = null;
    this.spreaderPathOutAttr = null;
    this.spreaderTitleInAttr = null;
    this.spreaderTitleOutAttr = null;

    //Percents
    this.minPercent = 0.01;
    this.maxPercent = 1;
    this.initPercent = 1;

    //Marker settings
    this.markerEnable = false;
    this.markerPathFunction = markerPath().TriangleMarker;
    this.markerPathCustom = null;

    //Private properties
    this.currentClick = 0;
    this.selectedNavItemIndex = 0;
    this.animateLocked = false;

    //NavItem default settings. These are configurable between initWheel() and createWheel().
    this.slicePathAttr = null;
    this.sliceHoverAttr = null;
    this.sliceSelectedAttr = null;
    
    this.titleFont = '100 24px Impact, Charcoal, sans-serif';
    this.titleAttr = null;
    this.titleHoverAttr = null;
    this.titleSelectedAttr = null;

    this.linePathAttr = null;
    this.lineHoverAttr = null;
    this.lineSelectedAttr = null;

    this.slicePathCustom = null;
    this.sliceClickablePathCustom = null;
    this.sliceSelectedPathCustom = null;
    this.sliceHoverPathCustom = null;
    this.sliceInitPathCustom = null;

    this.sliceTransformCustom = null;
    this.sliceSelectedTransformCustom = null;
    this.sliceHoverTransformCustom = null;
    this.sliceInitTransformCustom = null;

    this.animateeffect = null;
    this.animatetime = null;
    if (slicePath()["PieSlice"] !== undefined) {
        this.slicePathFunction = slicePath().PieSlice;
    }
    else {
        this.slicePathFunction = slicePath().NullSlice;
    }
    this.sliceClickablePathFunction = null;
    this.sliceTransformFunction = null;
    this.sliceSelectedPathFunction = null;
    this.sliceSelectedTransformFunction = null;
    this.sliceHoverPathFunction = null;
    this.sliceHoverTransformFunction = null;
    this.sliceInitPathFunction = null;
    this.sliceInitTransformFunction = null;

    this.parseWheel(holderDiv);

    return this;
};

wheelnav.prototype.initWheel = function (titles) {

    //Init slices and titles
    this.styleWheel();

    var navItem;
    if (this.navItemCount === 0) {

        if (titles === undefined ||
            titles === null ||
            !Array.isArray(titles)) {
            titles = ["title-0", "title-1", "title-2", "title-3"];
        }

        this.navItemCount = titles.length;
    }
    else {
        titles = null;
    }

    for (i = 0; i < this.navItemCount; i++) {

        var itemTitle = "";

        if (this.navItemCountLabeled) {
            itemTitle = (i + this.navItemCountLabelOffset).toString();
        }
        else {
            if (titles !== null)
                { itemTitle = titles[i]; }
            else
                { itemTitle = ""; }
        }

        navItem = new wheelnavItem(this, itemTitle, i);
        this.navItems.push(navItem);
    }

    //Init colors
    var colorIndex = 0;
    for (i = 0; i < this.navItems.length; i++) {
        this.navItems[i].fillAttr = this.colors[colorIndex];
        colorIndex++;
        if (colorIndex === this.colors.length) { colorIndex = 0;}
    }
};

wheelnav.prototype.createWheel = function (titles, withSpread) {

    if (this.currentPercent === null) {
        if (withSpread) {
            this.currentPercent = this.minPercent;
        }
        else {
            this.currentPercent = this.maxPercent;
        }
    }

    if (this.navItems.length === 0) {
        this.initWheel(titles);
    }

    if (this.selectedNavItemIndex !== null) {
        this.navItems[this.selectedNavItemIndex].selected = true;
    }

    for (i = 0; i < this.navItemCount; i++) {
        this.navItems[i].createNavItem();
    }

    this.spreader = new spreader(this);

    this.marker = new marker(this);

    this.refreshWheel();

    if (withSpread !== undefined) {
        this.spreadWheel();
    }

    return this;
};

wheelnav.prototype.refreshWheel = function (withPathAndTransform) {

    for (i = 0; i < this.navItemCount; i++) {
        var navItem = this.navItems[i];
        navItem.setWheelSettings(withPathAndTransform);
        navItem.refreshNavItem(withPathAndTransform);
    }

    this.marker.setCurrentTransform();
    this.spreader.setCurrentTransform();
};

wheelnav.prototype.navigateWheel = function (clicked) {

    this.animateUnlock(true);

    if (this.clickModeRotate) {
        this.animateLocked = true;
    }

    var navItem;

    for (i = 0; i < this.navItemCount; i++) {
        navItem = this.navItems[i];

        navItem.hovered = false;

        if (i === clicked) {
            if (this.multiSelect) {
                navItem.selected = !navItem.selected;
            } else {
                navItem.selected = true;
                this.selectedNavItemIndex = i;
            }
        }
        else {
            if (!this.multiSelect) {
                navItem.selected = false;
            }
        }

        if (this.clickModeRotate) {
            var rotationAngle = this.navItems[clicked].navAngle - this.navItems[this.currentClick].navAngle;

            if (this.rotateRound) {
                if (this.clockwise && rotationAngle < 0) {
                    rotationAngle = 360 + rotationAngle;
                }
                if (!this.clockwise && rotationAngle > 0) {
                    rotationAngle = rotationAngle - 360;
                }
            }

            navItem.currentRotateAngle -= rotationAngle;
            var currentAnimateTime;
            if (this.animatetime != null) {
                currentAnimateTime = this.animatetime;
            }
            else {
                currentAnimateTime = 1500;
            }

            if (this.animatetimeCalculated &&
                clicked !== this.currentClick) {
                navItem.animatetime = currentAnimateTime * (Math.abs(rotationAngle) / 360);
            }

            if (this.rotateRoundCount > 0) {
                if (this.clockwise) { navItem.currentRotateAngle -= this.rotateRoundCount * 360; }
                else { navItem.currentRotateAngle += this.rotateRoundCount * 360; }

                navItem.animatetime = currentAnimateTime * (this.rotateRoundCount + 1);
            }
        }
    }

    for (i = 0; i < this.navItemCount; i++) {
        navItem = this.navItems[i];
        navItem.setCurrentTransform(true, true);
        navItem.refreshNavItem();
    }

    this.currentClick = clicked;

    if (this.clickModeSpreadOff) {
        this.currentPercent = this.maxPercent;
        this.spreadWheel();
    }
    else {
        if (clicked !== null &&
            !this.clickModeRotate) {
            this.marker.setCurrentTransform(this.navItems[this.currentClick].navAngle);
        }
        else {
            this.marker.setCurrentTransform();
        }
        this.spreader.setCurrentTransform(true);
    }
};

wheelnav.prototype.spreadWheel = function () {

    this.animateUnlock(true);
    this.animateLocked = true;

    if (this.currentPercent === this.maxPercent ||
        this.currentPercent === null) {
        this.currentPercent = this.minPercent;
    }
    else {
        this.currentPercent = this.maxPercent;
    }

    for (i = 0; i < this.navItemCount; i++) {
        var navItem = this.navItems[i];
        navItem.hovered = false;
        navItem.setCurrentTransform(true, false);
    }

    this.marker.setCurrentTransform();
    this.spreader.setCurrentTransform();

    return this;
};

wheelnav.prototype.animateUnlock = function (force, withFinishFunction) {

    if (force !== undefined && 
        force === true) {
        for (var f = 0; f < this.navItemCount; f++) {
            this.navItems[f].navSliceUnderAnimation = false;
            this.navItems[f].navTitleUnderAnimation = false;
            this.navItems[f].navLineUnderAnimation = false;
            this.navItems[f].navSlice.stop();
            this.navItems[f].navLine.stop();
            this.navItems[f].navTitle.stop();
        }
    }
    else {
        for (var i = 0; i < this.navItemCount; i++) {
            if (this.navItems[i].navSliceUnderAnimation === true ||
                this.navItems[i].navTitleUnderAnimation === true ||
                this.navItems[i].navLineUnderAnimation === true) {
                return;
            }
        }

        this.animateLocked = false;
        if (this.animateFinishFunction !== null &&
            withFinishFunction !== undefined &&
            withFinishFunction === true) {
            this.animateFinishFunction();
        }
    }
};

wheelnav.prototype.setTooltips = function (tooltips) {
    if (tooltips !== undefined &&
        tooltips !== null &&
        Array.isArray(tooltips) &&
        tooltips.length <= this.navItems.length) {
        for (var i = 0; i < tooltips.length; i++) {
            this.navItems[i].setTooltip(tooltips[i]);
        }
    }
};

wheelnav.prototype.getItemId = function (index) {
    return "wheelnav-" + this.holderId + "-item-" + index;
};
wheelnav.prototype.getSliceId = function (index) {
    return "wheelnav-" + this.holderId + "-slice-" + index;
};
wheelnav.prototype.getClickableSliceId = function (index) {
    return "wheelnav-" + this.holderId + "-clickableslice-" + index;
};
wheelnav.prototype.getTitleId = function (index) {
    return "wheelnav-" + this.holderId + "-title-" + index;
};
wheelnav.prototype.getLineId = function (index) {
    return "wheelnav-" + this.holderId + "-line-" + index;
};
wheelnav.prototype.getSpreaderId = function () {
    return "wheelnav-" + this.holderId + "-spreader";
};
wheelnav.prototype.getSpreaderTitleId = function () {
    return "wheelnav-" + this.holderId + "-spreadertitle";
};
wheelnav.prototype.getMarkerId = function () {
    return "wheelnav-" + this.holderId + "-marker";
};

///#source 1 1 /js/source/wheelnav.parse.js
/* ======================================================================================= */
/* Parse html5 data- attributes, the onmouseup events and anchor links                     */
/* ======================================================================================= */
/* ======================================================================================= */
/* Documentation: http://wheelnavjs.softwaretailoring.net/documentation/html5.html         */
/* ======================================================================================= */

wheelnav.prototype.parseWheel = function (holderDiv) {
    if (holderDiv !== undefined &&
        holderDiv !== null) {
        //data-wheelnav attribute is required
        var wheelnavData = holderDiv.hasAttribute("data-wheelnav");
        if (wheelnavData) {
            var parsedNavItems = [];
            var parsedNavItemsHref = [];
            var parsedNavItemsOnmouseup = [];
            var onlyInit = false;

            //data-wheelnav-slicepath
            var wheelnavSlicepath = holderDiv.getAttribute("data-wheelnav-slicepath");
            if (wheelnavSlicepath !== null) {
                if (slicePath()[wheelnavSlicepath] !== undefined) {
                    this.slicePathFunction = slicePath()[wheelnavSlicepath];
                }
            }
            //data-wheelnav-colors
            var wheelnavColors = holderDiv.getAttribute("data-wheelnav-colors");
            if (wheelnavColors !== null) {
                this.colors = wheelnavColors.split(',');
            }
            //data-wheelnav-wheelradius
            var wheelnavWheelradius = holderDiv.getAttribute("data-wheelnav-wheelradius");
            if (wheelnavWheelradius !== null) {
                this.wheelRadius = Number(wheelnavWheelradius);
            }
            //data-wheelnav-navangle
            var wheelnavNavangle = holderDiv.getAttribute("data-wheelnav-navangle");
            if (wheelnavNavangle !== null) {
                this.navAngle = Number(wheelnavNavangle);
            }
            //data-wheelnav-rotateoff
            var wheelnavRotateOff = holderDiv.getAttribute("data-wheelnav-rotateoff");
            if (wheelnavRotateOff !== null) {
                this.clickModeRotate = false;
            }
            //data-wheelnav-cssmode
            var wheelnavCssmode = holderDiv.getAttribute("data-wheelnav-cssmode");
            if (wheelnavCssmode !== null) {
                this.cssMode = true;
            }
            //data-wheelnav-spreader
            var wheelnavSpreader = holderDiv.getAttribute("data-wheelnav-spreader");
            if (wheelnavSpreader !== null) {
                this.spreaderEnable = true;
            }
            //data-wheelnav-spreaderradius
            var wheelnavSpreaderRadius = holderDiv.getAttribute("data-wheelnav-spreaderradius");
            if (wheelnavSpreaderRadius !== null) {
                this.spreaderRadius = Number(wheelnavSpreaderRadius);
            }
            //data-wheelnav-spreaderpath
            var wheelnavSpreaderPath = holderDiv.getAttribute("data-wheelnav-spreaderpath");
            if (wheelnavSpreaderPath !== null) {
                if (markerPath()[wheelnavSpreaderPath] !== undefined) {
                    this.spreaderPathFunction = spreaderPath()[wheelnavSpreaderPath];
                }
            }
            //data-wheelnav-marker
            var wheelnavMarker = holderDiv.getAttribute("data-wheelnav-marker");
            if (wheelnavMarker !== null) {
                this.markerEnable = true;
            }
            //data-wheelnav-markerpath
            var wheelnavMarkerPath = holderDiv.getAttribute("data-wheelnav-markerpath");
            if (wheelnavMarkerPath !== null) {
                if (markerPath()[wheelnavMarkerPath] !== undefined) {
                    this.markerPathFunction = markerPath()[wheelnavMarkerPath];
                }
            }
            //data-wheelnav-init
            var wheelnavOnlyinit = holderDiv.getAttribute("data-wheelnav-init");
            if (wheelnavOnlyinit !== null) {
                onlyInit = true;
            }

            for (var i = 0; i < holderDiv.children.length; i++) {

                var wheelnavNavitemtext = holderDiv.children[i].getAttribute("data-wheelnav-navitemtext");
                var wheelnavNavitemicon = holderDiv.children[i].getAttribute("data-wheelnav-navitemicon");
                if (wheelnavNavitemtext !== null ||
                    wheelnavNavitemicon !== null) {
                    //data-wheelnav-navitemtext
                    if (wheelnavNavitemtext !== null) {
                        parsedNavItems.push(wheelnavNavitemtext);
                    }
                    //data-wheelnav-navitemicon
                    else if (wheelnavNavitemicon !== null) {
                        if (icon[wheelnavNavitemicon] !== undefined) {
                            parsedNavItems.push(icon[wheelnavNavitemicon]);
                        }
                        else {
                            parsedNavItems.push(wheelnavNavitemicon);
                        }
                    }
                    else {
                        //data-wheelnav-navitemtext or data-wheelnav-navitemicon is required
                        continue;
                    }

                    //onmouseup event of navitem element for call it in the navigateFunction
                    if (holderDiv.children[i].onmouseup !== undefined) {
                        parsedNavItemsOnmouseup.push(holderDiv.children[i].onmouseup);
                    }
                    else {
                        parsedNavItemsOnmouseup.push(null);
                    }

                    //parse inner <a> tag in navitem element for use href in navigateFunction
                    var foundHref = false;
                    for (var j = 0; j < holderDiv.children[i].children.length; j++) {
                        if (holderDiv.children[i].children[j].getAttribute('href') !== undefined) {
                            parsedNavItemsHref.push(holderDiv.children[i].children[j].getAttribute('href'));
                        }
                    }
                    if (!foundHref) {
                        parsedNavItemsHref.push(null);
                    }
                }
            }

            if (parsedNavItems.length > 0) {
                this.initWheel(parsedNavItems);

                for (var i = 0; i < parsedNavItemsOnmouseup.length; i++) {
                    this.navItems[i].navigateFunction = parsedNavItemsOnmouseup[i];
                    this.navItems[i].navigateHref = parsedNavItemsHref[i];
                }

                if (!onlyInit) {
                    this.createWheel();
                }
            }
        }

        var removeChildrens = [];
        for (var i = 0; i < holderDiv.children.length; i++) {
            if (holderDiv.children[i].localName !== "svg") {
                removeChildrens.push(holderDiv.children[i]);
            }
        }

        for (var i = 0; i < removeChildrens.length; i++) {
            holderDiv.removeChild(removeChildrens[i]);
        }
    }
};


///#source 1 1 /js/source/wheelnav.navItem.js
/* ======================================================================================= */
/* Navigation item                                                                         */
/* ======================================================================================= */
/* ======================================================================================= */
/* Documentation: http://wheelnavjs.softwaretailoring.net/documentation/navItem.html       */
/* ======================================================================================= */

wheelnavItem = function (wheelnav, title, itemIndex) {

    this.wheelnav = wheelnav;
    this.wheelItemIndex = itemIndex;
    if (wheelnav.clockwise) {
        this.itemIndex = itemIndex;
    }
    else {
        this.itemIndex = -itemIndex;
    }

    this.enabled = wheelnav.navItemsEnabled;
    this.selected = false;
    this.hovered = false;

    //Private properties
    this.navItem = null;
    this.navSlice = null;
    this.navTitle = null;
    this.navLine = null;
    this.navClickableSlice = null;

    this.navSliceCurrentTransformString = null;
    this.navTitleCurrentTransformString = null;
    this.navLineCurrentTransformString = null;

    this.navSliceUnderAnimation = false;
    this.navTitleUnderAnimation = false;
    this.navLineUnderAnimation = false;

    this.currentRotateAngle = 0;

    if (title === undefined) {
        this.title = null;
    }
    else {
        this.title = title;
    }
    this.titleHover = this.title;
    this.titleSelected = this.title;
    this.tooltip = null;
    
    //Default settings
    this.fillAttr = "#CCC";
    this.titleFont = this.wheelnav.titleFont;
    this.navigateHref = null;
    this.navigateFunction = null;

    //Wheelnav properties
    this.animateeffect = null;
    this.animatetime = null;

    this.sliceInitPathFunction = null;
    this.sliceClickablePathFunction = null;
    this.slicePathFunction = null;
    this.sliceSelectedPathFunction = null;
    this.sliceHoverPathFunction = null;

    this.sliceTransformFunction = null;
    this.sliceSelectedTransformFunction = null;
    this.sliceHoverTransformFunction = null;
    this.sliceInitTransformFunction = null;

    this.slicePathCustom = null;
    this.sliceClickablePathCustom = null;
    this.sliceSelectedPathCustom = null;
    this.sliceHoverPathCustom = null;
    this.sliceInitPathCustom = null;

    this.sliceTransformCustom = null;
    this.sliceSelectedTransformCustom = null;
    this.sliceHoverTransformCustom = null;
    this.sliceInitTransformCustom = null;

    this.initPercent = null;
    this.minPercent = null;
    this.maxPercent = null;
    this.hoverPercent = null;
    this.selectedPercent = null;
    this.clickablePercentMin = null;
    this.clickablePercentMax = null;

    this.titleSpreadScale = null;
    this.sliceAngle = null;

    //Default navitem styles
    this.styleNavItem();

    return this;
};

wheelnavItem.prototype.createNavItem = function () {

    //Wheel settings
    this.setWheelSettings(false);

    //Set href navigation
    if (this.navigateHref !== null) {
        this.navigateFunction = function () {
            window.location.href = this.navigateHref;
        };
    }

    //Set colors
    if (!this.wheelnav.cssMode) {
        this.slicePathAttr.fill = this.fillAttr;
        this.sliceHoverAttr.fill = this.fillAttr;
        this.sliceSelectedAttr.fill = this.fillAttr;
    }

    //Set attrs
    if (!this.enabled) {
        if (!this.wheelnav.cssMode) {
            this.slicePathAttr.cursor = "default";
            this.sliceHoverAttr.cursor = "default";
            this.titleAttr.cursor = "default";
            this.titleHoverAttr.cursor = "default";
            this.linePathAttr.cursor = "default";
            this.lineHoverAttr.cursor = "default";
        }

        this.sliceClickablePathAttr.cursor = "default";
        this.sliceClickableHoverAttr.cursor = "default";
    }

    //Set angles
    var prevItemIndex = this.wheelItemIndex - 1;
    var wheelSliceAngle = 360 / this.wheelnav.navItemCount;
    if (this.sliceAngle === null) {
        this.sliceAngle = 360 / this.wheelnav.navItemCount;
    }
    if (this.wheelnav.clockwise) {
        if (this.wheelnav.navItemsContinuous) {
            if (this.itemIndex === 0) {
                this.baseAngle = (this.itemIndex * this.sliceAngle) + ((-this.sliceAngle / 2) + this.wheelnav.navAngle);
            }
            else {
                this.baseAngle = this.wheelnav.navItems[prevItemIndex].baseAngle + this.wheelnav.navItems[prevItemIndex].sliceAngle;
            }
        }
        else {
            if (this.wheelnav.navItemsCentered) {
                this.baseAngle = (this.itemIndex * wheelSliceAngle) + ((-this.sliceAngle / 2) + this.wheelnav.navAngle);
            }
            else {
                this.baseAngle = (this.itemIndex * wheelSliceAngle) + ((-wheelSliceAngle / 2) + this.wheelnav.navAngle);
                this.currentRotateAngle += ((wheelSliceAngle / 2) - (this.wheelnav.navItems[0].sliceAngle / 2));
            }
        }
    }
    else {
        if (this.wheelnav.navItemsContinuous) {
            if (this.itemIndex === 0) {
                this.baseAngle = (this.itemIndex * this.sliceAngle) + ((-this.sliceAngle / 2) + this.wheelnav.navAngle);
            }
            else {
                this.baseAngle = this.wheelnav.navItems[prevItemIndex].baseAngle - this.wheelnav.navItems[this.wheelItemIndex].sliceAngle;
            }
        }
        else {
            if (this.wheelnav.navItemsCentered) {
                this.baseAngle = (this.itemIndex * wheelSliceAngle) + ((-this.sliceAngle / 2) + this.wheelnav.navAngle);
            }
            else {
                this.baseAngle = (this.itemIndex * wheelSliceAngle) + ((-wheelSliceAngle / 2) + this.wheelnav.navAngle) + (wheelSliceAngle - this.sliceAngle);
                this.currentRotateAngle -= ((wheelSliceAngle / 2) - (this.wheelnav.navItems[0].sliceAngle / 2));
            }
        }
    }

    this.navAngle = this.baseAngle + (this.sliceAngle / 2);

    if (this.wheelnav.animatetimeCalculated) {
        this.animatetime = this.wheelnav.animatetime / this.wheelnav.navItemCount;
    }

    this.initPathsAndTransforms();

    var sliceInitPath = this.sliceInitPath;

    //Create slice
    this.navSlice = this.wheelnav.raphael.path(sliceInitPath.slicePathString);
    this.navSlice.attr(this.slicePathAttr);
    this.navSlice.id = this.wheelnav.getSliceId(this.wheelItemIndex);
    this.navSlice.node.id = this.navSlice.id;

    //Create linepath
    this.navLine = this.wheelnav.raphael.path(sliceInitPath.linePathString);
    this.navLine.attr(this.linePathAttr);
    this.navLine.id = this.wheelnav.getLineId(this.wheelItemIndex);
    this.navLine.node.id = this.navLine.id;

    //Create title
    var currentTitle = this.initNavTitle;

    //Title defined by path
    
    if (wheelnavTitle().isPathTitle(this.title)) {
        this.navTitle = this.wheelnav.raphael.path(currentTitle.path);
    }
    //Title defined by text
    else {
        this.navTitle = this.wheelnav.raphael.text(sliceInitPath.titlePosX, sliceInitPath.titlePosY, currentTitle.title);
    }

    this.navTitle.attr(this.titleAttr);
    this.navTitle.id = this.wheelnav.getTitleId(this.wheelItemIndex);
    this.navTitle.node.id = this.navTitle.id;

    //Set transforms
    this.navSliceCurrentTransformString = "";
    if (this.initTransform.sliceTransformString !== "") { this.navSliceCurrentTransformString += this.initTransform.sliceTransformString; }

    this.navLineCurrentTransformString = "";
    if (this.initTransform.lineTransformString !== "") { this.navLineCurrentTransformString += this.initTransform.lineTransformString; }

    this.navTitleCurrentTransformString = "";
    if (this.wheelnav.initTitleRotate) { this.navTitleCurrentTransformString += this.getTitleRotateString(); }
    if (this.initTransform.titleTransformString !== "") { this.navTitleCurrentTransformString += this.initTransform.titleTransformString; }
    if (this.wheelnav.currentPercent < 0.05) {
        this.navTitleCurrentTransformString += ",s0.05";
    }

    this.navSlice.attr({ transform: this.navSliceCurrentTransformString });
    this.navLine.attr({ transform: this.navLineCurrentTransformString });
    this.navTitle.attr({ transform: this.navTitleCurrentTransformString });
    
    //Create item set
    this.navItem = this.wheelnav.raphael.set();

    if (this.sliceClickablePathFunction !== null) {
        //Create clickable slice
        var sliceClickablePath = this.getCurrentClickablePath();
        this.navClickableSlice = this.wheelnav.raphael.path(sliceClickablePath.slicePathString).attr(this.sliceClickablePathAttr).toBack();
        this.navClickableSlice.id = this.wheelnav.getClickableSliceId(this.wheelItemIndex);
        this.navClickableSlice.node.id = this.navClickableSlice.id;
        
        this.navItem.push(
            this.navSlice,
            this.navLine,
            this.navTitle,
            this.navClickableSlice
        );
    }
    else {
        this.navItem.push(
            this.navSlice,
            this.navLine,
            this.navTitle
        );
    }

    this.setTooltip(this.tooltip);
    this.navItem.id = this.wheelnav.getItemId(this.wheelItemIndex);

    var thisWheelNav = this.wheelnav;
    var thisNavItem = this;
    var thisItemIndex = this.wheelItemIndex;

    if (this.enabled) {
        this.navItem.mouseup(function () {
            
            if (thisNavItem.navigateFunction !== null) {
                thisNavItem.navigateFunction();
            }

            thisWheelNav.navigateWheel(thisItemIndex);
        });
        this.navItem.mouseover(function () {
            if (thisNavItem.hovered !== true) {
                thisNavItem.hoverEffect(thisItemIndex, true);
            }
        });
        this.navItem.mouseout(function () {
            thisNavItem.hovered = false;
            thisNavItem.hoverEffect(thisItemIndex, false);
        });
    }

    this.setCurrentTransform(true, false);
};

wheelnavItem.prototype.hoverEffect = function (hovered, isEnter) {

    if (this.wheelnav.animateLocked === false) {
        if (isEnter) {
            if (!this.selected) {
                this.hovered = true;
            }
        }

        this.refreshNavItem();

        if (this.hoverPercent !== 1 ||
            this.sliceHoverPathFunction !== null ||
            this.sliceHoverTransformFunction !== null ||
            this.titleHover !== this.title) {
            this.setCurrentTransform(false, false);
        }

        this.wheelnav.marker.setCurrentTransform();
        this.wheelnav.spreader.setCurrentTransform(true);
    }
};

wheelnavItem.prototype.setCurrentTransform = function (locked, withFinishFunction) {

    if (!this.wheelnav.clickModeRotate ||
        (!this.navSliceUnderAnimation &&
        !this.navTitleUnderAnimation &&
        !this.navLineUnderAnimation)) {

        if (locked !== undefined &&
            locked === true) {
            this.navSliceUnderAnimation = true;
            this.navTitleUnderAnimation = true;
            this.navLineUnderAnimation = true;
        }

        //Set transforms
        this.navSliceCurrentTransformString = "";
        if (this.wheelnav.clickModeRotate) { this.navSliceCurrentTransformString += this.getItemRotateString(); }
        if (this.selected) {
            if (this.selectTransform.sliceTransformString !== undefined) { this.navSliceCurrentTransformString += this.selectTransform.sliceTransformString; }
        }
        else if (this.hovered) {
            if (this.hoverTransform.sliceTransformString !== undefined) { this.navSliceCurrentTransformString += this.hoverTransform.sliceTransformString; }
        }
        if (this.sliceTransform.sliceTransformString !== undefined) { this.navSliceCurrentTransformString += this.sliceTransform.sliceTransformString; }

        this.navLineCurrentTransformString = "";
        if (this.wheelnav.clickModeRotate) { this.navLineCurrentTransformString += this.getItemRotateString(); }
        if (this.selected) {
            if (this.selectTransform.lineTransformString !== undefined) { this.navLineCurrentTransformString += this.selectTransform.lineTransformString; }
        }
        else if (this.hovered) {
            if (this.hoverTransform.lineTransformString !== undefined) { this.navLineCurrentTransformString += this.hoverTransform.lineTransformString; }
        }
        if (this.sliceTransform.lineTransformString !== undefined) { this.navLineCurrentTransformString += this.sliceTransform.lineTransformString; }

        this.navTitleCurrentTransformString = "";
        this.navTitleCurrentTransformString += this.getTitleRotateString();

        if (this.selected) {
            if (this.selectTransform.titleTransformString === "" ||
                this.selectTransform.titleTransformString === undefined) {
                this.navTitleCurrentTransformString += ",s1";
            }
            else {
                this.navTitleCurrentTransformString += "," + this.selectTransform.titleTransformString;
            }
            if (this.wheelnav.currentPercent < 0.05) {
                this.navTitleCurrentTransformString += ",s0.05";
            }
        }
        else if (this.hovered) {
            if (this.hoverTransform.titleTransformString === "" ||
                this.hoverTransform.titleTransformString === undefined) {
                this.navTitleCurrentTransformString += ",s1";
            }
            else {
                this.navTitleCurrentTransformString += "," + this.hoverTransform.titleTransformString;
            }
        }
        else if (this.wheelnav.currentPercent < 0.05) {
            this.navTitleCurrentTransformString += ",s0.05";
        }
        else if (this.titleSpreadScale) {
            this.navTitleCurrentTransformString += ",s" + this.wheelnav.currentPercent;
        }
        else {
            if (this.sliceTransform.titleTransformString === "" ||
                this.sliceTransform.titleTransformString === undefined) {
                this.navTitleCurrentTransformString += ",s1";
            }
            else {
                this.navTitleCurrentTransformString += "," + this.sliceTransform.titleTransformString;
            }
        }

        //Set path
        var slicePath = this.getCurrentPath();

        var sliceTransformAttr = {};

        sliceTransformAttr = {
            path: slicePath.slicePathString,
            transform: this.navSliceCurrentTransformString
        };

        var sliceClickableTransformAttr = {};

        if (this.sliceClickablePathFunction !== null) {
            var sliceClickablePath = this.getCurrentClickablePath();

            sliceClickableTransformAttr = {
                path: sliceClickablePath.slicePathString,
                transform: this.navSliceCurrentTransformString
            };
        }

        var lineTransformAttr = {};

        lineTransformAttr = {
            path: slicePath.linePathString,
            transform: this.navLineCurrentTransformString
        };

        //Set title
        var currentTitle = this.getCurrentTitle();
        
        var titleTransformAttr = {};

        if (this.navTitle.type === "path") {
            titleTransformAttr = {
                path: currentTitle.path,
                transform: this.navTitleCurrentTransformString
            };
        }
        else {
            titleTransformAttr = {
                x: currentTitle.x,
                y: currentTitle.y,
                transform: this.navTitleCurrentTransformString
            };

            if (currentTitle.title !== null) {
                this.navTitle.attr({ text: currentTitle.title });
            }
        }

        var thisNavItem = this;
        var thisWheelnav = this.wheelnav;

        //Animate navitem
        this.animSlice = Raphael.animation(sliceTransformAttr, this.animatetime, this.animateeffect, function () {
            thisNavItem.navSliceUnderAnimation = false;
            thisWheelnav.animateUnlock(false, withFinishFunction);
        });
        this.animLine = Raphael.animation(lineTransformAttr, this.animatetime, this.animateeffect, function () {
            thisNavItem.navLineUnderAnimation = false;
            thisWheelnav.animateUnlock(false, withFinishFunction);
        });
        this.animTitle = Raphael.animation(titleTransformAttr, this.animatetime, this.animateeffect, function () {
            thisNavItem.navTitleUnderAnimation = false;
            thisWheelnav.animateUnlock(false, withFinishFunction);
        });

        if (this.navClickableSlice !== null) {
            this.animClickableSlice = Raphael.animation(sliceClickableTransformAttr, this.animatetime, this.animateeffect);
        }

        var animateRepeatCount = this.wheelnav.animateRepeatCount;

        if (locked !== undefined &&
            locked === true) {
            if (this.wheelItemIndex === this.wheelnav.navItemCount - 1) {

                for (i = 0; i < this.wheelnav.navItemCount; i++) {
                    var navItemSlice = this.wheelnav.navItems[i];
                    navItemSlice.navSlice.animate(navItemSlice.animSlice.repeat(animateRepeatCount));
                }
                for (i = 0; i < this.wheelnav.navItemCount; i++) {
                    var navItemLine = this.wheelnav.navItems[i];
                    navItemLine.navLine.animate(navItemLine.animLine.repeat(animateRepeatCount));
                }
                for (i = 0; i < this.wheelnav.navItemCount; i++) {
                    var navItemTitle = this.wheelnav.navItems[i];
                    navItemTitle.navTitle.animate(navItemTitle.animTitle.repeat(animateRepeatCount));
                }

                if (this.wheelnav.sliceClickablePathFunction !== null) {
                    for (i = 0; i < this.wheelnav.navItemCount; i++) {
                        var navItemClickableSlice = this.wheelnav.navItems[i];
                        if (navItemClickableSlice.navClickableSlice !== null) {
                            navItemClickableSlice.navClickableSlice.animate(navItemClickableSlice.animClickableSlice.repeat(animateRepeatCount));
                        }
                    }
                }
            }
        }
        else {
            this.navSlice.animate(this.animSlice.repeat(animateRepeatCount));
            this.navLine.animate(this.animLine.repeat(animateRepeatCount));
            this.navTitle.animate(this.animTitle.repeat(animateRepeatCount));

            if (this.navClickableSlice !== null) {
                this.navClickableSlice.animate(this.animClickableSlice.repeat(animateRepeatCount));
            }
        }
    }
};

wheelnavItem.prototype.setTooltip = function (tooltip) {
    if (tooltip !== null) {
        this.navItem.attr({ title: tooltip });
    }
};

wheelnavItem.prototype.refreshNavItem = function (withPathAndTransform) {

    if (this.selected) {
        this.navSlice.attr(this.sliceSelectedAttr);
        this.navLine.attr(this.lineSelectedAttr);
        this.navTitle.attr(this.titleSelectedAttr);
        if (this.navClickableSlice !== null) { this.navClickableSlice.attr(this.sliceClickableSelectedAttr); }

        if (this.wheelnav.selectedToFront) {
            this.navSlice.toFront();
            this.navLine.toFront();
            this.navTitle.toFront();
            if (this.navClickableSlice !== null) { this.navClickableSlice.toFront(); }
        }
        else {
            if (this.navClickableSlice !== null) { this.navClickableSlice.toBack(); }
            this.navTitle.toBack();
            this.navLine.toBack();
            this.navSlice.toBack();
        }
    }
    else if (this.hovered) {
        this.navSlice.attr(this.sliceHoverAttr).toFront();
        this.navLine.attr(this.lineHoverAttr).toFront();
        this.navTitle.attr(this.titleHoverAttr).toFront();
        if (this.navClickableSlice !== null) { this.navClickableSlice.attr(this.sliceClickableHoverAttr).toFront(); }
    }
    else {
        this.navSlice.attr(this.slicePathAttr);
        this.navLine.attr(this.linePathAttr);
        this.navTitle.attr(this.titleAttr);
        if (this.navClickableSlice !== null) { this.navClickableSlice.attr(this.sliceClickablePathAttr); }

        if (this.navClickableSlice !== null) { this.navClickableSlice.toBack(); };
        this.navTitle.toBack();
        this.navLine.toBack();
        this.navSlice.toBack();
    }
    
    if (withPathAndTransform !== undefined &&
        withPathAndTransform === true) {
        this.initPathsAndTransforms();
        this.setCurrentTransform(false, false);
    }
};

wheelnavItem.prototype.setWheelSettings = function (force) {

    //Set slice from wheelnav
    if (this.wheelnav.slicePathAttr !== null) { this.slicePathAttr = JSON.parse(JSON.stringify(this.wheelnav.slicePathAttr)); }
    if (this.wheelnav.sliceHoverAttr !== null) { this.sliceHoverAttr = JSON.parse(JSON.stringify(this.wheelnav.sliceHoverAttr)); }
    if (this.wheelnav.sliceSelectedAttr !== null) { this.sliceSelectedAttr = JSON.parse(JSON.stringify(this.wheelnav.sliceSelectedAttr)); }
    
    //Set title from wheelnav
    if (this.wheelnav.titleAttr !== null) { this.titleAttr = JSON.parse(JSON.stringify(this.wheelnav.titleAttr)); }
    if (this.wheelnav.titleHoverAttr !== null) { this.titleHoverAttr = JSON.parse(JSON.stringify(this.wheelnav.titleHoverAttr)); }
    if (this.wheelnav.titleSelectedAttr !== null) { this.titleSelectedAttr = JSON.parse(JSON.stringify(this.wheelnav.titleSelectedAttr)); }

    //Set line from wheelnav
    if (this.wheelnav.linePathAttr !== null) { this.linePathAttr = JSON.parse(JSON.stringify(this.wheelnav.linePathAttr)); }
    if (this.wheelnav.lineHoverAttr !== null) { this.lineHoverAttr = JSON.parse(JSON.stringify(this.wheelnav.lineHoverAttr)); }
    if (this.wheelnav.lineSelectedAttr !== null) { this.lineSelectedAttr = JSON.parse(JSON.stringify(this.wheelnav.lineSelectedAttr)); }

    //Set animation from wheelnav
    if (this.animateeffect === null || force) {
        if (this.wheelnav.animateeffect !== null) { this.animateeffect = this.wheelnav.animateeffect; }
        else { this.animateeffect = "bounce"; }
    }
    if (this.animatetime === null || force) {
        if (this.wheelnav.animatetime !== null) { this.animatetime = this.wheelnav.animatetime; }
        else { this.animatetime = 1500; }
    }

    if (this.title !== null) {
        if (this.sliceInitPathFunction === null || force) { this.sliceInitPathFunction = this.wheelnav.sliceInitPathFunction; }
        if (this.sliceClickablePathFunction === null || force) { this.sliceClickablePathFunction = this.wheelnav.sliceClickablePathFunction; }
        if (this.slicePathFunction === null || force) { this.slicePathFunction = this.wheelnav.slicePathFunction; }
        if (this.sliceSelectedPathFunction === null || force) { this.sliceSelectedPathFunction = this.wheelnav.sliceSelectedPathFunction; }
        if (this.sliceHoverPathFunction === null || force) { this.sliceHoverPathFunction = this.wheelnav.sliceHoverPathFunction; }
            
        if (this.sliceTransformFunction === null || force) { this.sliceTransformFunction = this.wheelnav.sliceTransformFunction; }
        if (this.sliceSelectedTransformFunction === null || force) { this.sliceSelectedTransformFunction = this.wheelnav.sliceSelectedTransformFunction; }
        if (this.sliceHoverTransformFunction === null || force) { this.sliceHoverTransformFunction = this.wheelnav.sliceHoverTransformFunction; }
        if (this.sliceInitTransformFunction === null || force) { this.sliceInitTransformFunction = this.wheelnav.sliceInitTransformFunction; }
    }
    else {
        this.sliceInitPathFunction = slicePath().NullInitSlice;
        this.sliceClickablePathFunction = slicePath().NullSlice;
        this.slicePathFunction = slicePath().NullSlice;
        this.sliceSelectedPathFunction = null;
        this.sliceHoverPathFunction = null;
        this.sliceTransformFunction = null;
        this.sliceSelectedTransformFunction = null;
        this.sliceHoverTransformFunction = null;
        this.sliceInitTransformFunction = null;
    }

    if (this.slicePathCustom === null || force) { this.slicePathCustom = this.wheelnav.slicePathCustom; }
    if (this.sliceClickablePathCustom === null || force) { this.sliceClickablePathCustom = this.wheelnav.sliceClickablePathCustom; }
    if (this.sliceSelectedPathCustom === null || force) { this.sliceSelectedPathCustom = this.wheelnav.sliceSelectedPathCustom; }
    if (this.sliceHoverPathCustom === null || force) { this.sliceHoverPathCustom = this.wheelnav.sliceHoverPathCustom; }
    if (this.sliceInitPathCustom === null || force) { this.sliceInitPathCustom = this.wheelnav.sliceInitPathCustom; }

    if (this.sliceTransformCustom === null || force) { this.sliceTransformCustom = this.wheelnav.sliceTransformCustom; }
    if (this.sliceSelectedTransformCustom === null || force) { this.sliceSelectedTransformCustom = this.wheelnav.sliceSelectedTransformCustom; }
    if (this.sliceHoverTransformCustom === null || force) { this.sliceHoverTransformCustom = this.wheelnav.sliceHoverTransformCustom; }
    if (this.sliceInitTransformCustom === null || force) { this.sliceInitTransformCustom = this.wheelnav.sliceInitTransformCustom; }

    if (this.initPercent === null || force) { this.initPercent = this.wheelnav.initPercent; }
    if (this.minPercent === null || force) { this.minPercent = this.wheelnav.minPercent; }
    if (this.maxPercent === null || force) { this.maxPercent = this.wheelnav.maxPercent; }
    if (this.hoverPercent === null || force) { this.hoverPercent = this.wheelnav.hoverPercent; }
    if (this.selectedPercent === null || force) { this.selectedPercent = this.wheelnav.selectedPercent; }
    if (this.clickablePercentMin === null || force) { this.clickablePercentMin = this.wheelnav.clickablePercentMin; }
    if (this.clickablePercentMax === null || force) { this.clickablePercentMax = this.wheelnav.clickablePercentMax; }

    if (this.titleSpreadScale === null || force) {
        if (this.wheelnav.titleSpreadScale !== null) { this.titleSpreadScale = this.wheelnav.titleSpreadScale; }
        else { this.titleSpreadScale = false; }
    }
    if (this.sliceAngle === null || force) {
        if (this.wheelnav.sliceAngle !== null) { this.sliceAngle = this.wheelnav.sliceAngle; }
    }
};

wheelnavItem.prototype.initPathsAndTransforms = function () {

    this.sliceHelper = new pathHelper();
    this.sliceHelper.centerX = this.wheelnav.centerX;
    this.sliceHelper.centerY = this.wheelnav.centerY;
    this.sliceHelper.wheelRadius = this.wheelnav.wheelRadius;
    this.sliceHelper.startAngle = this.baseAngle;
    this.sliceHelper.sliceAngle = this.sliceAngle;
    this.sliceHelper.itemIndex = this.itemIndex;

    //Set min/max sliecePaths
    //Default - min
    this.slicePathMin = this.slicePathFunction(this.sliceHelper, this.minPercent, this.slicePathCustom);

    //Default - max
    this.slicePathMax = this.slicePathFunction(this.sliceHelper, this.maxPercent, this.slicePathCustom);

    //Selected - min
    if (this.sliceSelectedPathFunction !== null) {
        this.selectedSlicePathMin = this.sliceSelectedPathFunction(this.sliceHelper, this.selectedPercent * this.minPercent, this.sliceSelectedPathCustom);
    }
    else {
        this.selectedSlicePathMin = this.slicePathFunction(this.sliceHelper, this.selectedPercent * this.minPercent, this.sliceSelectedPathCustom);
    }

    //Selected - max
    if (this.sliceSelectedPathFunction !== null) {
        this.selectedSlicePathMax = this.sliceSelectedPathFunction(this.sliceHelper, this.selectedPercent * this.maxPercent, this.sliceSelectedPathCustom);
    }
    else {
        this.selectedSlicePathMax = this.slicePathFunction(this.sliceHelper, this.selectedPercent * this.maxPercent, this.sliceSelectedPathCustom);
    }

    //Hovered - min
    if (this.sliceHoverPathFunction !== null) {
        this.hoverSlicePathMin = this.sliceHoverPathFunction(this.sliceHelper, this.hoverPercent * this.minPercent, this.sliceHoverPathCustom);
    }
    else {
        this.hoverSlicePathMin = this.slicePathFunction(this.sliceHelper, this.hoverPercent * this.minPercent, this.sliceHoverPathCustom);
    }

    //Hovered - max
    if (this.sliceHoverPathFunction !== null) {
        this.hoverSlicePathMax = this.sliceHoverPathFunction(this.sliceHelper, this.hoverPercent * this.maxPercent, this.sliceHoverPathCustom);
    }
    else {
        this.hoverSlicePathMax = this.slicePathFunction(this.sliceHelper, this.hoverPercent * this.maxPercent, this.sliceHoverPathCustom);
    }

    //Set min/max sliececlickablePaths
    
    if (this.sliceClickablePathFunction !== null) {
        //Default - min
        this.clickableSlicePathMin = this.sliceClickablePathFunction(this.sliceHelper, this.clickablePercentMin, this.sliceClickablePathCustom);
        //Default - max
        this.clickableSlicePathMax = this.sliceClickablePathFunction(this.sliceHelper, this.clickablePercentMax, this.sliceClickablePathCustom);
    }

    //Initial path
    if (this.sliceInitPathFunction !== null) {
        this.sliceInitPath = this.sliceInitPathFunction(this.sliceHelper, this.initPercent, this.sliceInitPathCustom);
    }
    else {
        if (this.wheelnav.currentPercent === this.wheelnav.maxPercent) {
            this.sliceInitPath = this.slicePathFunction(this.sliceHelper, this.maxPercent, this.sliceInitPathCustom);
        }
        else {
            this.sliceInitPath = this.slicePathFunction(this.sliceHelper, this.minPercent, this.sliceInitPathCustom);
        }
    }

    //Set sliceTransforms
    //Default
    if (this.sliceTransformFunction !== null) {
        this.sliceTransform = this.sliceTransformFunction(this.wheelnav.centerX, this.wheelnav.centerY, this.wheelnav.wheelRadius, this.baseAngle, this.sliceAngle, this.wheelnav.titleRotateAngle, this.itemIndex, this.sliceTransformCustom);
    }
    else {
        this.sliceTransform = sliceTransform().NullTransform;
    }

    //Selected
    if (this.sliceSelectedTransformFunction !== null) {
        this.selectTransform = this.sliceSelectedTransformFunction(this.wheelnav.centerX, this.wheelnav.centerY, this.wheelnav.wheelRadius, this.baseAngle, this.sliceAngle, this.wheelnav.titleRotateAngle, this.itemIndex, this.sliceSelectedTransformCustom);
    }
    else {
        this.selectTransform = sliceTransform().NullTransform;
    }

    //Hovered
    if (this.sliceHoverTransformFunction !== null) {
        this.hoverTransform = this.sliceHoverTransformFunction(this.wheelnav.centerX, this.wheelnav.centerY, this.wheelnav.wheelRadius, this.baseAngle, this.sliceAngle, this.wheelnav.titleRotateAngle, this.itemIndex, this.sliceHoverTransformCustom);
    }
    else {
        this.hoverTransform = sliceTransform().NullTransform;
    }

    //Initial transform
    if (this.sliceInitTransformFunction !== null) {
        this.initTransform = this.sliceInitTransformFunction(this.wheelnav.centerX, this.wheelnav.centerY, this.wheelnav.wheelRadius, this.baseAngle, this.sliceAngle, this.wheelnav.titleRotateAngle, this.itemIndex, this.sliceInitTransformCustom);
    }
    else {
        this.initTransform = sliceTransform().NullTransform;
    }

    //Set titles
    if (wheelnavTitle().isPathTitle(this.title)) {
        initNavTitle = new wheelnavTitle(this.title, this.wheelnav.raphael.raphael);
        basicNavTitleMin = new wheelnavTitle(this.title, this.wheelnav.raphael.raphael);
        basicNavTitleMax = new wheelnavTitle(this.title, this.wheelnav.raphael.raphael);
        hoverNavTitleMin = new wheelnavTitle(this.titleHover, this.wheelnav.raphael.raphael);
        hoverNavTitleMax = new wheelnavTitle(this.titleHover, this.wheelnav.raphael.raphael);
        selectedNavTitleMin = new wheelnavTitle(this.titleSelected, this.wheelnav.raphael.raphael);
        selectedNavTitleMax = new wheelnavTitle(this.titleSelected, this.wheelnav.raphael.raphael);
    }
    else {
        initNavTitle = new wheelnavTitle(this.title);
        basicNavTitleMin = new wheelnavTitle(this.title);
        basicNavTitleMax = new wheelnavTitle(this.title);
        hoverNavTitleMin = new wheelnavTitle(this.titleHover);
        hoverNavTitleMax = new wheelnavTitle(this.titleHover);
        selectedNavTitleMin = new wheelnavTitle(this.titleSelected);
        selectedNavTitleMax = new wheelnavTitle(this.titleSelected);
    }

    this.initNavTitle = initNavTitle.getTitlePercentAttr(this.sliceInitPath.titlePosX, this.sliceInitPath.titlePosY);
    this.basicNavTitleMin = basicNavTitleMin.getTitlePercentAttr(this.slicePathMin.titlePosX, this.slicePathMin.titlePosY);
    this.basicNavTitleMax = basicNavTitleMax.getTitlePercentAttr(this.slicePathMax.titlePosX, this.slicePathMax.titlePosY);
    this.hoverNavTitleMin = hoverNavTitleMin.getTitlePercentAttr(this.hoverSlicePathMin.titlePosX, this.hoverSlicePathMin.titlePosY);
    this.hoverNavTitleMax = hoverNavTitleMax.getTitlePercentAttr(this.hoverSlicePathMax.titlePosX, this.hoverSlicePathMax.titlePosY);
    this.selectedNavTitleMin = selectedNavTitleMin.getTitlePercentAttr(this.selectedSlicePathMin.titlePosX, this.selectedSlicePathMin.titlePosY);
    this.selectedNavTitleMax = selectedNavTitleMax.getTitlePercentAttr(this.selectedSlicePathMax.titlePosX, this.selectedSlicePathMax.titlePosY);
};

wheelnavItem.prototype.getCurrentPath = function () {
    var slicePath;

    if (this.wheelnav.currentPercent === this.wheelnav.maxPercent) {
        if (this.selected) {
            slicePath = this.selectedSlicePathMax;
        }
        else {
            if (this.hovered) {
                slicePath = this.hoverSlicePathMax;
            }
            else {
                slicePath = this.slicePathMax;
            }
        }
    }
    else {
        if (this.selected) {
            slicePath = this.selectedSlicePathMin;
        }
        else {
            if (this.hovered) {
                slicePath = this.hoverSlicePathMin;
            }
            else {
                slicePath = this.slicePathMin;
            }
        }
    }

    return slicePath;
};

wheelnavItem.prototype.getCurrentClickablePath = function () {
    var sliceClickablePath;

    if (this.wheelnav.currentPercent === this.wheelnav.maxPercent) {
        sliceClickablePath = this.clickableSlicePathMax;
    }
    else {
        sliceClickablePath = this.clickableSlicePathMin;
    }

    return sliceClickablePath;
};

wheelnavItem.prototype.getCurrentTitle = function () {
    var currentTitle;

    if (this.wheelnav.currentPercent === this.wheelnav.maxPercent) {
        if (this.selected) {
            currentTitle = this.selectedNavTitleMax;
        }
        else {
            if (this.hovered) {
                currentTitle = this.hoverNavTitleMax;
            }
            else {
                currentTitle = this.basicNavTitleMax;
            }
        }
    }
    else {
        if (this.selected) {
            currentTitle = this.selectedNavTitleMin;
        }
        else {
            if (this.hovered) {
                currentTitle = this.hoverNavTitleMin;
            }
            else {
                currentTitle = this.basicNavTitleMin;
            }
        }
    }

    return currentTitle;
};

wheelnavItem.prototype.getItemRotateString = function () {
    return "r," + (this.currentRotateAngle).toString() + "," + this.wheelnav.centerX + "," + this.wheelnav.centerY;
};

wheelnavItem.prototype.getTitleRotateString = function () {

    var titleRotate = "";

    if (this.wheelnav.titleRotateAngle !== null) {
        titleRotate += this.getItemRotateString();
        titleRotate += ",r," + (this.navAngle + this.wheelnav.titleRotateAngle).toString();
    }
    else {
        titleRotate += this.getItemRotateString();
        titleRotate += ",r," + (-this.currentRotateAngle).toString();
    }

    return titleRotate;
};

wheelnavTitle = function (title, raphael) {
    this.title = title;
    //Calculate relative path
    if (title !== null) {
        if (raphael !== undefined) {
            this.relativePath = raphael.pathToRelative(title);
            var bbox = raphael.pathBBox(this.relativePath);
            this.centerX = bbox.cx;
            this.centerY = bbox.cy;
            this.startX = this.relativePath[0][1];
            this.startY = this.relativePath[0][2];
            this.title = "";
        }
    }
    else {
        this.title = "";
    }

    this.isPathTitle = function (title) {
        if (title !== null &&
            (title.substr(0, 1) === "m" ||
            title.substr(0, 1) === "M") &&
            (title.substr(title.length - 1, 1) === "z" ||
            title.substr(title.length - 1, 1) === "Z")) {
            return true;
        }
        else {
            return false;
        }
    };

    return this;
};

wheelnavTitle.prototype.getTitlePercentAttr = function (currentX, currentY) {

    var transformAttr = {};

    if (this.relativePath !== undefined) {
        var pathCx = currentX + (this.startX - this.centerX);
        var pathCy = currentY + (this.startY - this.centerY);

        this.relativePath[0][1] = pathCx;
        this.relativePath[0][2] = pathCy;

        transformAttr = {
            path: this.relativePath
        };
    }
    else {
        transformAttr = {
            x: currentX,
            y: currentY,
            title: this.title
        };
    }

    return transformAttr;
};


///#source 1 1 /js/source/wheelnav.style.js
/* ======================================================================================= */
/* Default styles and available css classes                                                */
/* ======================================================================================= */
/* ======================================================================================= */
/* Documentation: http://wheelnavjs.softwaretailoring.net/documentation/css3.html          */
/* ======================================================================================= */

wheelnav.prototype.styleWheel = function () {
    if (!this.cssMode) {
        if (this.spreaderPathInAttr === undefined || this.spreaderPathInAttr === null) {
            this.spreaderPathInAttr = { fill: "#444", stroke: "#444", "stroke-width": 2, cursor: 'pointer' };
        }
        if (this.spreaderPathOutAttr === undefined || this.spreaderPathOutAttr === null) {
            this.spreaderPathOutAttr = { fill: "#444", stroke: "#444", "stroke-width": 2, cursor: 'pointer' };
        }
        if (this.spreaderTitleInAttr === undefined || this.spreaderTitleInAttr === null) {
            this.spreaderTitleInAttr = { fill: "#eee", stroke: "#444", cursor: 'pointer' };
        }
        if (this.spreaderTitleOutAttr === undefined || this.spreaderTitleOutAttr === null) {
            this.spreaderTitleOutAttr = { fill: "#eee", stroke: "#444", cursor: 'pointer' };
        }
        if (this.markerAttr === undefined || this.markerAttr === null) {
            this.markerAttr = { stroke: "#444", "stroke-width": 2 };
        }
    }
    else {
        this.spreaderPathInAttr = { "class": this.getSpreaderCssClass("in") };
        this.spreaderPathOutAttr = { "class": this.getSpreaderCssClass("out") };
        this.spreaderTitleInAttr = { "class": this.getSpreaderTitleCssClass("in") };
        this.spreaderTitleOutAttr = { "class": this.getSpreaderTitleCssClass("out") };
        this.markerAttr = { "class": this.getMarkerCssClass() };
    }
};

wheelnavItem.prototype.styleNavItem = function () {
    if (!this.wheelnav.cssMode) {
        this.slicePathAttr = { stroke: "#333", "stroke-width": 0, cursor: 'pointer', "fill-opacity": 1 };
        this.sliceHoverAttr = { stroke: "#222", "stroke-width": 0, cursor: 'pointer', "fill-opacity": 0.77 };
        this.sliceSelectedAttr = { stroke: "#111", "stroke-width": 0, cursor: 'default', "fill-opacity": 1 };

        this.titleAttr = { font: this.titleFont, fill: "#333", stroke: "none", cursor: 'pointer' };
        this.titleHoverAttr = { font: this.titleFont, fill: "#222", cursor: 'pointer', stroke: "none" };
        this.titleSelectedAttr = { font: this.titleFont, fill: "#fff", cursor: 'default' };

        this.linePathAttr = { stroke: "#444", "stroke-width": 1, cursor: 'pointer' };
        this.lineHoverAttr = { stroke: "#222", "stroke-width": 2, cursor: 'pointer' };
        this.lineSelectedAttr = { stroke: "#444", "stroke-width": 1, cursor: 'default' };
    }
    else {
        this.slicePathAttr = { "class": this.wheelnav.getSliceCssClass(this.wheelItemIndex, "basic") };
        this.sliceHoverAttr = { "class": this.wheelnav.getSliceCssClass(this.wheelItemIndex, "hover") };
        this.sliceSelectedAttr = { "class": this.wheelnav.getSliceCssClass(this.wheelItemIndex, "selected") };

        this.titleAttr = { "class": this.wheelnav.getTitleCssClass(this.wheelItemIndex, "basic") };
        this.titleHoverAttr = { "class": this.wheelnav.getTitleCssClass(this.wheelItemIndex, "hover") };
        this.titleSelectedAttr = { "class": this.wheelnav.getTitleCssClass(this.wheelItemIndex, "selected") };

        this.linePathAttr = { "class": this.wheelnav.getLineCssClass(this.wheelItemIndex, "basic") };
        this.lineHoverAttr = { "class": this.wheelnav.getLineCssClass(this.wheelItemIndex, "hover") };
        this.lineSelectedAttr = { "class": this.wheelnav.getLineCssClass(this.wheelItemIndex, "selected") };
    }

    this.sliceClickablePathAttr = { fill: "#FFF", stroke: "#FFF", "stroke-width": 0, cursor: 'pointer', "fill-opacity": 0.01 };
    this.sliceClickableHoverAttr = { stroke: "#FFF", "stroke-width": 0, cursor: 'pointer' };
    this.sliceClickableSelectedAttr = { stroke: "#FFF", "stroke-width": 0, cursor: 'default' };
}

wheelnav.prototype.getSliceCssClass = function (index, subclass) {
    return "wheelnav-" + this.holderId + "-slice-" + subclass + "-" + index;
};
wheelnav.prototype.getTitleCssClass = function (index, subclass) {
    return "wheelnav-" + this.holderId + "-title-" + subclass + "-" + index;
};
wheelnav.prototype.getLineCssClass = function (index, subclass) {
    return "wheelnav-" + this.holderId + "-line-" + subclass + "-" + index;
};
wheelnav.prototype.getSpreaderCssClass = function (state) {
    return "wheelnav-" + this.holderId + "-spreader-" + state;
};
wheelnav.prototype.getSpreaderTitleCssClass = function (state) {
    return "wheelnav-" + this.holderId + "-spreadertitle-" + state;
};
wheelnav.prototype.getMarkerCssClass = function () {
    return "wheelnav-" + this.holderId + "-marker";
};

///#source 1 1 /js/source/wheelnav.pathHelper.js
/* ======================================================================================= */
/* Slice path helper functions                                                                  */
/* ======================================================================================= */
/* ======================================================================================= */
/* Documentation: http://wheelnavjs.softwaretailoring.net/documentation/slicePath.html     */
/* ======================================================================================= */

var pathHelper = function () {

    this.sliceRadius = 0;
    this.startAngle = 0;
    this.middleAngle = 0;
    this.endAngle = 0;
    this.sliceAngle = 0;
    this.startTheta = 0;
    this.middleTheta = 0;
    this.endTheta = 0;
    this.titlePosX = 0;
    this.titlePosY = 0;
    this.titleRadius = 0;
    this.titleTheta = 0;
    this.custom = null;
    this.centerX = 0;
    this.centerY = 0;
    this.wheelRadius = 0;
    this.itemIndex = 0;
    this.navItemCount = 0;
    this.navAngle = 0;

    this.setBaseValue = function (percent, custom) {

        if (custom === null) {
            custom = new slicePathCustomization();
        }
        else {
            this.custom = custom;
        }

        this.sliceRadius = this.wheelRadius * percent * 0.9;

        this.middleAngle = this.startAngle + this.sliceAngle / 2;
        this.endAngle = this.startAngle + this.sliceAngle;

        this.startTheta = this.getTheta(this.startAngle);
        this.middleTheta = this.getTheta(this.middleAngle);
        this.endTheta = this.getTheta(this.endAngle);

        if (custom !== null) {
            if (custom.titleRadiusPercent !== null) {
                this.titleRadius = this.sliceRadius * custom.titleRadiusPercent;
            }
            if (custom.titleSliceAnglePercent !== null) {
                this.titleTheta = this.getTheta(this.startAngle + this.sliceAngle * custom.titleSliceAnglePercent);
            }
        }
        else {
            this.titleRadius = this.sliceRadius * 0.5;
            this.titleTheta = this.middleTheta;
        }

        this.setTitlePos();
    };

    this.setTitlePos = function () {
        this.titlePosX = this.titleRadius * Math.cos(this.titleTheta) + this.centerX;
        this.titlePosY = this.titleRadius * Math.sin(this.titleTheta) + this.centerY;
    };

    this.getX = function (angle, length) {
        return length * Math.cos(this.getTheta(angle)) + this.centerX;
    };

    this.getY = function (angle, length) {
        return length * Math.sin(this.getTheta(angle)) + this.centerY;
    };

    this.MoveTo = function (angle, length) {
        return ["M", this.getX(angle, length), this.getY(angle, length)];
    };

    this.MoveToCenter = function () {
        return ["M", this.centerX, this.centerY];
    };

    this.LineTo = function (angle, length, angleY, lengthY) {
        if (angleY === undefined) {
            angleY = angle;
        }
        if (lengthY === undefined) {
            lengthY = length;
        }
        return ["L", this.getX(angle, length), this.getY(angleY, lengthY)];
    };

    this.ArcTo = function (arcRadius, angle, length) {
        return ["A", arcRadius, arcRadius, 0, 0, 1, this.getX(angle, length), this.getY(angle, length)]
    };

    this.ArcBackTo = function (arcRadius, angle, length) {
        return ["A", arcRadius, arcRadius, 0, 0, 0, this.getX(angle, length), this.getY(angle, length)]
    };

    this.StartSpreader = function (spreaderPathString, angle, length) {
        if (this.endAngle - this.startAngle === 360) {
            spreaderPathString.push(this.MoveTo(angle, length));
        }
        else {
            spreaderPathString.push(this.MoveToCenter());
            spreaderPathString.push(this.LineTo(angle, length));
        }
    };

    this.Close = function () {
        return ["z"];
    };

    this.getTheta = function (angle) {
        return (angle % 360) * Math.PI / 180;
    };

    return this;
};

/* Custom properties
    - titleRadiusPercent
    - titleSliceAnglePercent
*/
var slicePathCustomization = function () {

    this.titleRadiusPercent = 0.5;
    this.titleSliceAnglePercent = 0.5;

    return this;
};

/* Custom properties
    - titleRadiusPercent
    - titleSliceAnglePercent
    - spreaderPercent
*/
var spreaderPathCustomization = function () {

    this.titleRadiusPercent = 0;
    this.titleSliceAnglePercent = 0.5;
    this.spreaderPercent = 1;

    return this;
};

/* Custom properties
    - titleRadiusPercent
    - titleSliceAnglePercent
    - markerPercent
*/
var markerPathCustomization = function () {

    this.titleRadiusPercent = 1;
    this.titleSliceAnglePercent = 0.5;
    this.markerPercent = 1.05;

    return this;
};


///#source 1 1 /js/source/slicePath/wheelnav.slicePath.core.js
///#source 1 1 /js/source/slicePath/wheelnav.slicePathStart.js
/* ======================================================================================= */
/* Slice path definitions.                                                                 */
/* ======================================================================================= */
/* ======================================================================================= */
/* Documentation: http://wheelnavjs.softwaretailoring.net/documentation/slicePath.html     */
/* ======================================================================================= */

slicePath = function () {

    this.NullSlice = function (helper, percent, custom) {

        helper.setBaseValue(percent, custom);

        return {
            slicePathString: "",
            linePathString: "",
            titlePosX: helper.titlePosX,
            titlePosY: helper.titlePosY
        };
    };

    this.NullInitSlice = function (helper, percent, custom) {

        helper.setBaseValue(percent, custom);

        slicePathString = [helper.MoveToCenter(),
                 helper.Close()];

        return {
            slicePathString: slicePathString,
            linePathString: slicePathString,
            titlePosX: helper.centerX,
            titlePosY: helper.centerY
        };
    };

///#source 1 1 /js/source/slicePath/wheelnav.slicePathEnd.js

    return this;
};




///#source 1 1 /js/source/wheelnav.sliceTransform.js
/* ======================================================================================== */
/* Slice transform definitions                                                              */
/* ======================================================================================== */
/* ======================================================================================== */
/* Documentation: http://wheelnavjs.softwaretailoring.net/documentation/sliceTransform.html */
/* ======================================================================================== */


var sliceTransform = function () {

    this.startAngle = 0;
    this.startTheta = 0;
    this.middleTheta = 0;
    this.endTheta = 0;

    var setBaseValue = function (x, y, rOriginal, baseAngle, sliceAngle, titleRotateAngle, itemIndex, custom) {
        this.startAngle = baseAngle;
        this.startTheta = getTheta(startAngle);
        this.middleTheta = getTheta(startAngle + sliceAngle / 2);
        this.endTheta = getTheta(startAngle + sliceAngle);
    };

    var getTheta = function (angle) {
        return (angle % 360) * Math.PI / 180;
    };

    this.NullTransform = function (x, y, rOriginal, baseAngle, sliceAngle, titleRotateAngle, itemIndex, custom) {
        return {
            sliceTransformString: "",
            lineTransformString: "",
            titleTransformString: ""
        };
    };

    this.MoveMiddleTransform = function (x, y, rOriginal, baseAngle, sliceAngle, titleRotateAngle, itemIndex, custom) {

        setBaseValue(x, y, rOriginal, baseAngle, sliceAngle, titleRotateAngle, itemIndex);
        var sliceTransformString = "t" + (rOriginal / 10 * Math.cos(middleTheta)).toString() + "," + (rOriginal / 10 * Math.sin(middleTheta)).toString();

        var baseTheta;
        if (titleRotateAngle !== null) {
            baseTheta = getTheta(-titleRotateAngle);
        }
        else {
            var wheelBaseAngle = baseAngle - (itemIndex * sliceAngle);
            baseTheta = getTheta(wheelBaseAngle + sliceAngle / 2);
        }

        var titleTransformString = "s1,r0,t" + (rOriginal / 10 * Math.cos(baseTheta)).toString() + "," + (rOriginal / 10 * Math.sin(baseTheta)).toString();

        return {
            sliceTransformString: sliceTransformString,
            lineTransformString: sliceTransformString,
            titleTransformString: titleTransformString
        };
    };

    this.RotateTransform = function (x, y, rOriginal, baseAngle, sliceAngle, titleRotateAngle, itemIndex, custom) {

        var sliceTransformString = "s1,r360";

        return {
            sliceTransformString: sliceTransformString,
            lineTransformString: sliceTransformString,
            titleTransformString: sliceTransformString
        };
    };

    this.RotateHalfTransform = function (x, y, rOriginal, baseAngle, sliceAngle, titleRotateAngle, itemIndex, custom) {

        var sliceTransformString = "s1,r90";

        return {
            sliceTransformString: sliceTransformString,
            lineTransformString: sliceTransformString,
            titleTransformString: sliceTransformString
        };
    };

    this.RotateTitleTransform = function (x, y, rOriginal, baseAngle, sliceAngle, titleRotateAngle, itemIndex, custom) {

        var titleTransformString = "s1,r360";

        return {
            sliceTransformString: "",
            lineTransformString: "",
            titleTransformString: titleTransformString
        };
    };

    this.ScaleTransform = function (x, y, rOriginal, baseAngle, sliceAngle, titleRotateAngle, itemIndex, custom) {

        var sliceTransformString = "s1.2";

        return {
            sliceTransformString: sliceTransformString,
            lineTransformString: "",
            titleTransformString: sliceTransformString
        };
    };

    this.ScaleTitleTransform = function (x, y, rOriginal, baseAngle, sliceAngle, titleRotateAngle, itemIndex, custom) {

        return {
            sliceTransformString: "",
            lineTransformString: "",
            titleTransformString: "s1.3"
        };
    };

    this.RotateScaleTransform = function (x, y, rOriginal, baseAngle, sliceAngle, titleRotateAngle, itemIndex, custom) {

        var sliceTransformString = "r360,s1.3";

        return {
            sliceTransformString: sliceTransformString,
            lineTransformString: "",
            titleTransformString: sliceTransformString
        };
    };

    this.CustomTransform = function (x, y, rOriginal, baseAngle, sliceAngle, titleRotateAngle, itemIndex, custom) {

        var sliceTransformString = custom.scaleString + "," + custom.rotateString;

        return {
            sliceTransformString: sliceTransformString,
            lineTransformString: sliceTransformString,
            titleTransformString: sliceTransformString
        };
    };

    this.CustomTitleTransform = function (x, y, rOriginal, baseAngle, sliceAngle, titleRotateAngle, itemIndex, custom) {

        var titleTransformString = custom.scaleString + "," + custom.rotateString;

        return {
            sliceTransformString: "",
            lineTransformString: "",
            titleTransformString: titleTransformString
        };
    };

    return this;
};

/* Custom properties
    - scaleString
    - rotateString
*/
var sliceTransformCustomization = function () {

    this.scaleString = "s1";
    this.rotateString = "r0";

    return this;
};




///#source 1 1 /js/source/spreader/wheelnav.spreader.js
///#source 1 1 /js/source/spreader/wheelnav.spreader.core.js
/* ======================================================================================= */
/* Spreader of wheel                                                                       */
/* ======================================================================================= */
/* ======================================================================================= */
/* Documentation: http://wheelnavjs.softwaretailoring.net/documentation/spreader.html      */
/* ======================================================================================= */

spreader = function (wheelnav) {

    this.wheelnav = wheelnav;
    if (this.wheelnav.spreaderEnable) {

        this.spreaderHelper = new pathHelper();
        this.spreaderHelper.centerX = this.wheelnav.centerX;
        this.spreaderHelper.centerY = this.wheelnav.centerY;
        this.spreaderHelper.navItemCount = this.wheelnav.navItemCount;
        this.spreaderHelper.navAngle = this.wheelnav.navAngle;
        this.spreaderHelper.wheelRadius = this.wheelnav.spreaderRadius;
        this.spreaderHelper.startAngle = this.wheelnav.spreaderStartAngle;
        this.spreaderHelper.sliceAngle = this.wheelnav.spreaderSliceAngle;

        var thisWheelNav = this.wheelnav;
        this.animateeffect = "bounce";
        this.animatetime = 1500;
        //Set animation from wheelnav
        if (this.wheelnav.animateeffect !== null) { this.animateeffect = this.wheelnav.animateeffect; }
        if (this.wheelnav.animatetime !== null) { this.animatetime = this.wheelnav.animatetime; }

        if (this.wheelnav.spreaderTitleFont !== null) { this.fontAttr = { font: this.wheelnav.spreaderTitleFont }; }
        else { this.fontAttr = { font: '100 32px Impact, Charcoal, sans-serif' }; }

        this.spreaderPathIn = this.wheelnav.spreaderPathFunction(this.spreaderHelper, this.wheelnav.spreaderInPercent, this.wheelnav.spreaderPathCustom);
        this.spreaderPathOut = this.wheelnav.spreaderPathFunction(this.spreaderHelper, this.wheelnav.spreaderOutPercent, this.wheelnav.spreaderPathCustom);

        var currentPath = this.spreaderPathOut;
        if (thisWheelNav.initPercent < thisWheelNav.maxPercent) {
            currentPath = this.spreaderPathIn;
        }

        this.spreaderPath = this.wheelnav.raphael.path(currentPath.spreaderPathString);
        this.spreaderPath.attr(thisWheelNav.spreaderPathAttr);
        this.spreaderPath.id = thisWheelNav.getSpreaderId();
        this.spreaderPath.node.id = this.spreaderPath.id;
        this.spreaderPath.click(function () {
            thisWheelNav.spreadWheel();
        });

        //Set titles
        if (wheelnavTitle().isPathTitle(this.wheelnav.spreaderInTitle)) {
            inTitle = new wheelnavTitle(this.wheelnav.spreaderInTitle, this.wheelnav.raphael.raphael);
            this.inTitle = inTitle.getTitlePercentAttr(this.spreaderPathIn.titlePosX, this.spreaderPathIn.titlePosY);
        }
        else {
            inTitle = new wheelnavTitle(this.wheelnav.spreaderInTitle);
            this.inTitle = inTitle.getTitlePercentAttr(this.spreaderPathIn.titlePosX, this.spreaderPathIn.titlePosY);
        }

        if (wheelnavTitle().isPathTitle(this.wheelnav.spreaderOutTitle)) {
            outTitle = new wheelnavTitle(this.wheelnav.spreaderOutTitle, this.wheelnav.raphael.raphael);
            this.outTitle = outTitle.getTitlePercentAttr(this.spreaderPathOut.titlePosX, this.spreaderPathOut.titlePosY);
        }
        else {
            outTitle = new wheelnavTitle(this.wheelnav.spreaderOutTitle);
            this.outTitle = outTitle.getTitlePercentAttr(this.spreaderPathOut.titlePosX, this.spreaderPathOut.titlePosY);
        }

        var currentTitle = this.outTitle;
        var currentTitleAttr = this.wheelnav.spreaderTitleOutAttr;
        if (thisWheelNav.initPercent < thisWheelNav.maxPercent) {
            currentTitle = this.inTitle;
            currentTitleAttr = this.wheelnav.spreaderTitleInAttr;
        }

        if (wheelnavTitle().isPathTitle(this.wheelnav.spreaderOutTitle)) {
            this.spreaderTitle = thisWheelNav.raphael.path(currentTitle.path);
        }
        else {
            this.spreaderTitle = thisWheelNav.raphael.text(currentPath.titlePosX, currentPath.titlePosY, currentTitle.title);
        }
        
        this.spreaderTitle.attr(this.fontAttr);
        this.spreaderTitle.attr(currentTitleAttr);
        this.spreaderTitle.id = thisWheelNav.getSpreaderTitleId();
        this.spreaderTitle.node.id = this.spreaderTitle.id;
        this.spreaderTitle.click(function () {
            thisWheelNav.spreadWheel();
        });

        this.setCurrentTransform();
    }

    return this;
};

spreader.prototype.setCurrentTransform = function (withoutAnimate) {
    if (this.wheelnav.spreaderEnable) {

        if (withoutAnimate === undefined ||
            withoutAnimate === false) {
            
            if (this.wheelnav.currentPercent > this.wheelnav.minPercent) {
                currentPath = this.spreaderPathOut.spreaderPathString;
            }
            else {
                currentPath = this.spreaderPathIn.spreaderPathString;
            }

            spreaderTransformAttr = {
                path: currentPath
            };

            //Animate spreader
            this.spreaderPath.animate(spreaderTransformAttr, this.animatetime, this.animateeffect);

            //titles
            var currentTitle;
            var titleTransformAttr;

            if (this.wheelnav.currentPercent === this.wheelnav.maxPercent) {
                currentTitle = this.outTitle;
                titleTransformAttr = this.wheelnav.spreaderTitleOutAttr;
                this.spreaderPath.attr(this.wheelnav.spreaderPathOutAttr);
            }
            else {
                currentTitle = this.inTitle;
                titleTransformAttr = this.wheelnav.spreaderTitleInAttr;
                this.spreaderPath.attr(this.wheelnav.spreaderPathInAttr);
            }

            if (this.spreaderTitle.type === "path") {
                titleTransformAttr.path = currentTitle.path;
            }
            else {
                //Little hack for proper appearance of "-" sign
                offYOffset = 0;
                if (currentTitle.title === "-") { offYOffset = 3; };

                titleTransformAttr.x = currentTitle.x;
                titleTransformAttr.y = currentTitle.y - offYOffset;

                if (currentTitle.title !== null) {
                    this.spreaderTitle.attr({ text: currentTitle.title });
                }
            }

            //Animate title
            this.spreaderTitle.animate(titleTransformAttr, this.animatetime, this.animateeffect);
        }

        this.spreaderPath.toFront();
        this.spreaderTitle.toFront();
    }
};

///#source 1 1 /js/source/spreader/wheelnav.spreaderPathStart.js
/* ======================================================================================= */
/* Spreader path definitions.                                                              */
/* ======================================================================================= */

spreaderPath = function () {

    this.NullSpreader = function (helper, custom) {

        if (custom === null) {
            custom = new spreaderPathCustomization();
        }

        helper.setBaseValue(custom.spreaderPercent, custom);

        return {
            spreaderPathString: "",
            titlePosX: helper.titlePosX,
            titlePosY: helper.titlePosY
        };
    };



///#source 1 1 /js/source/spreader/wheelnav.spreaderPath.Pie.js

this.PieSpreaderCustomization = function () {

    var custom = new spreaderPathCustomization();
    custom.spreaderRadius = 25;
    custom.arcBaseRadiusPercent = 1;
    custom.arcRadiusPercent = 1;
    custom.startRadiusPercent = 0;
    return custom;
};

this.PieSpreader = function (helper, percent, custom) {

    if (custom === null) {
        custom = PieSpreaderCustomization();
    }

    helper.setBaseValue(custom.spreaderPercent * percent, custom);

    var arcBaseRadius = helper.sliceRadius * custom.arcBaseRadiusPercent;
    var arcRadius = helper.sliceRadius * custom.arcRadiusPercent;

    spreaderPathString = [];
    helper.StartSpreader(spreaderPathString, helper.startAngle, arcBaseRadius);
    spreaderPathString.push(helper.ArcTo(arcRadius, helper.middleAngle, arcBaseRadius));
    spreaderPathString.push(helper.ArcTo(arcRadius, helper.endAngle, arcBaseRadius));
    spreaderPathString.push(helper.Close());

    return {
        spreaderPathString: spreaderPathString,
        titlePosX: helper.titlePosX,
        titlePosY: helper.titlePosY
    };
};

///#source 1 1 /js/source/spreader/wheelnav.spreaderPath.Star.js

this.StarSpreaderCustomization = function () {

    var custom = new spreaderPathCustomization();
    custom.minRadiusPercent = 0.5;

    return custom;
};

this.StarSpreader = function (helper, percent, custom) {

    if (custom === null) {
        custom = StarSpreaderCustomization();
    }

    helper.setBaseValue(custom.spreaderPercent * percent, custom);
    rbase = helper.wheelRadius * custom.spreaderPercent * custom.minRadiusPercent * percent;
    r = helper.sliceRadius;

    spreaderPathString = [];

    sliceAngle = helper.sliceAngle / helper.navItemCount;
    baseAngle = helper.navAngle;
    if (helper.endAngle - helper.startAngle < 360) { baseAngle = helper.startAngle; }

    helper.StartSpreader(spreaderPathString, baseAngle, r);

    for (var i = 0; i < helper.navItemCount; i++) {
        startAngle = i * sliceAngle + (baseAngle + sliceAngle / 2);
        middleAngle = startAngle + (sliceAngle / 2);
        endAngle = startAngle + sliceAngle;
        if (helper.endAngle - helper.startAngle < 360) {
            if (i === helper.navItemCount - 1) { endAngle = middleAngle; }
        }
        spreaderPathString.push(helper.LineTo(startAngle, rbase));
        spreaderPathString.push(helper.LineTo(middleAngle, r));
        spreaderPathString.push(helper.LineTo(endAngle, rbase));
    }

    spreaderPathString.push(helper.Close());

    return {
        spreaderPathString: spreaderPathString,
        titlePosX: helper.titlePosX,
        titlePosY: helper.titlePosY
    };
};


///#source 1 1 /js/source/spreader/wheelnav.spreaderPath.AntiStar.js

this.AntiStarSpreaderCustomization = function () {

    var custom = new spreaderPathCustomization();
    custom.minRadiusPercent = 0.21;

    return custom;
};

this.AntiStarSpreader = function (helper, percent, custom) {

    if (custom === null) {
        custom = AntiStarSpreaderCustomization();
    }

    helper.setBaseValue(custom.spreaderPercent * percent, custom);
    rbase = helper.wheelRadius * custom.spreaderPercent * custom.minRadiusPercent * percent;
    r = helper.sliceRadius;

    spreaderPathString = [];

    sliceAngle = helper.sliceAngle / helper.navItemCount;
    baseAngle = helper.navAngle;
    if (helper.endAngle - helper.startAngle < 360) {
        baseAngle = helper.startAngle;
        helper.StartSpreader(spreaderPathString, baseAngle, rbase);
    }
    else {
        spreaderPathString.push(helper.MoveTo(helper.startAngle + (helper.navAngle + sliceAngle / 2), rbase));
    }

    for (var i = 0; i < helper.navItemCount; i++) {
        startAngle = i * sliceAngle + (baseAngle + sliceAngle / 2);
        middleAngle = startAngle + (sliceAngle / 2);
        endAngle = startAngle + sliceAngle;

        if (helper.endAngle - helper.startAngle < 360) {
            if (i === helper.navItemCount - 1) { endAngle = middleAngle; }
        }

        spreaderPathString.push(helper.LineTo(startAngle, r));
        spreaderPathString.push(helper.LineTo(middleAngle, rbase));
        spreaderPathString.push(helper.LineTo(endAngle, r));
    }

    spreaderPathString.push(helper.Close());

    return {
        spreaderPathString: spreaderPathString,
        titlePosX: helper.titlePosX,
        titlePosY: helper.titlePosY
    };
};


///#source 1 1 /js/source/spreader/wheelnav.spreaderPath.Flower.js

this.FlowerSpreaderCustomization = function () {

    var custom = new spreaderPathCustomization();
    custom.minRadiusPercent = 0.63
    custom.menuRadius = 7;;

    return custom;
};

this.FlowerSpreader = function (helper, percent, custom) {

    if (custom === null) {
        custom = FlowerSpreaderCustomization();
    }

    helper.setBaseValue(custom.spreaderPercent * percent, custom);
    rbase = helper.wheelRadius * custom.spreaderPercent * custom.minRadiusPercent * percent;
    r = helper.sliceRadius;

    spreaderPathString = [];

    sliceAngle = helper.sliceAngle / helper.navItemCount;
    baseAngle = helper.navAngle;
    if (helper.endAngle - helper.startAngle < 360) {
        baseAngle = helper.startAngle;
        helper.StartSpreader(spreaderPathString, baseAngle, rbase);
    }
    else {
        spreaderPathString.push(helper.MoveTo(helper.startAngle + (helper.navAngle + sliceAngle / 2), rbase));
    }
    
    for (var i = 0; i < helper.navItemCount; i++) {
        startAngle = i * sliceAngle + (baseAngle + sliceAngle / 2);
        middleAngle = startAngle + (sliceAngle / 2);
        endAngle = startAngle + sliceAngle;

        if (helper.endAngle - helper.startAngle < 360) {
            if (i === 0) { spreaderPathString.push(helper.ArcTo(custom.menuRadius, startAngle, rbase)); }
            if (i === helper.navItemCount - 1) { endAngle = middleAngle; }
        }
        else {
            spreaderPathString.push(helper.LineTo(startAngle, rbase));
        }

        spreaderPathString.push(helper.ArcTo(custom.menuRadius, endAngle, rbase));
    }

    spreaderPathString.push(helper.Close());

    return {
        spreaderPathString: spreaderPathString,
        titlePosX: helper.titlePosX,
        titlePosY: helper.titlePosY
    };
};


///#source 1 1 /js/source/spreader/wheelnav.spreaderPath.Holder.js

this.HolderSpreaderCustomization = function () {

    var custom = new spreaderPathCustomization();
    custom.minRadiusPercent = 0.5;
    custom.menuRadius = 37;

    return custom;
};

this.HolderSpreader = function (helper, percent, custom) {

    if (custom === null) {
        custom = HolderSpreaderCustomization();
    }

    helper.setBaseValue(custom.spreaderPercent * percent, custom);
    rbase = helper.wheelRadius * custom.spreaderPercent * custom.minRadiusPercent * percent;
    r = helper.sliceRadius;

    spreaderPathString = [];

    sliceAngle = helper.sliceAngle / helper.navItemCount;
    baseAngle = helper.navAngle;
    if (helper.endAngle - helper.startAngle < 360) {
        baseAngle = helper.startAngle;
        helper.StartSpreader(spreaderPathString, baseAngle, rbase);
    }
    else {
        spreaderPathString.push(helper.MoveTo(helper.startAngle + (helper.navAngle + sliceAngle / 2), rbase));
    }

    for (var i = 0; i < helper.navItemCount; i++) {
        startAngle = i * sliceAngle + (baseAngle + sliceAngle / 2);
        middleAngle = startAngle + (sliceAngle / 4);
        endAngle = startAngle + sliceAngle;

        if (helper.endAngle - helper.startAngle < 360) {
            if (i === helper.navItemCount - 1) { endAngle = middleAngle; }
        }
        else {
            spreaderPathString.push(helper.LineTo(startAngle, rbase));
        }

        spreaderPathString.push(helper.LineTo(startAngle, r));
        spreaderPathString.push(helper.ArcBackTo(custom.menuRadius, middleAngle, rbase));
        spreaderPathString.push(helper.ArcTo(custom.menuRadius, endAngle, r));
    }

    spreaderPathString.push(helper.Close());

    return {
        spreaderPathString: spreaderPathString,
        titlePosX: helper.titlePosX,
        titlePosY: helper.titlePosY
    };
};


///#source 1 1 /js/source/spreader/wheelnav.spreaderPath.Line.js

this.LineSpreaderCustomization = function () {

    var custom = new spreaderPathCustomization();
    custom.minRadiusPercent = 0.5;

    return custom;
};

this.LineSpreader = function (helper, percent, custom) {

    if (custom === null) {
        custom = LineSpreaderCustomization();
    }

    helper.setBaseValue(custom.spreaderPercent * percent, custom);
    rbase = helper.wheelRadius * custom.spreaderPercent * custom.minRadiusPercent * percent;
    r = helper.sliceRadius;

    spreaderPathString = [];

    sliceAngle = helper.sliceAngle / helper.navItemCount;
    baseAngle = helper.navAngle;
    if (helper.endAngle - helper.startAngle < 360) { baseAngle = helper.startAngle; }

    spreaderPathString.push(helper.MoveTo(baseAngle + sliceAngle / 2, r));

    for (var i = 0; i < helper.navItemCount; i++) {
        startAngle = i * sliceAngle + (baseAngle + sliceAngle / 2);
        endAngle = startAngle + sliceAngle;
        if (helper.navItemCount === 2) {
            endAngle -= 90;
        }

        spreaderPathString.push(helper.LineTo(startAngle, r));
        spreaderPathString.push(helper.LineTo(endAngle, r));
    }

    spreaderPathString.push(helper.Close());

    return {
        spreaderPathString: spreaderPathString,
        titlePosX: helper.titlePosX,
        titlePosY: helper.titlePosY
    };
};


///#source 1 1 /js/source/spreader/wheelnav.spreaderPathEnd.js

    return this;
};




///#source 1 1 /js/source/marker/wheelnav.marker.js
///#source 1 1 /js/source/marker/wheelnav.marker.core.js
/* ======================================================================================= */
/* Marker of wheel                                                                         */
/* ======================================================================================= */
/* ======================================================================================= */
/* Documentation: http://wheelnavjs.softwaretailoring.net/documentation/marker.html        */
/* ======================================================================================= */

marker = function (wheelnav) {

    this.wheelnav = wheelnav;
    if (this.wheelnav.markerEnable) {

        this.markerHelper = new pathHelper();
        this.markerHelper.centerX = this.wheelnav.centerX;
        this.markerHelper.centerY = this.wheelnav.centerY;
        this.markerHelper.navItemCount = this.wheelnav.navItemCount;
        this.markerHelper.navAngle = this.wheelnav.navAngle;
        this.markerHelper.wheelRadius = this.wheelnav.wheelRadius * this.wheelnav.maxPercent;
        this.markerHelper.sliceAngle = this.wheelnav.navItems[0].sliceAngle;
        this.markerHelper.startAngle = this.markerHelper.navAngle - (this.markerHelper.sliceAngle / 2);

        this.animateeffect = "bounce";
        this.animatetime = 1500;
        //Set animation from wheelnav
        if (this.wheelnav.animateeffect !== null) { this.animateeffect = this.wheelnav.animateeffect; }
        if (this.wheelnav.animatetime !== null) { this.animatetime = this.wheelnav.animatetime; }

        this.markerPathMin = this.wheelnav.markerPathFunction(this.markerHelper, this.wheelnav.minPercent, this.wheelnav.markerPathCustom);
        this.markerPathMax = this.wheelnav.markerPathFunction(this.markerHelper, this.wheelnav.maxPercent, this.wheelnav.markerPathCustom);
        this.marker = this.wheelnav.raphael.path(this.markerPathMax.markerPathString);
        this.marker.attr(this.wheelnav.markerAttr);
        this.marker.id = this.wheelnav.getMarkerId();
        this.marker.node.id = this.marker.id;
    }

    return this;
};

marker.prototype.setCurrentTransform = function (navAngle) {

    if (this.wheelnav.markerEnable) {
        var currentPath = "";

        if (this.wheelnav.currentPercent === this.wheelnav.maxPercent) {
            currentPath = this.markerPathMax.markerPathString;
        }
        else {
            currentPath = this.markerPathMin.markerPathString;
        }

        if (navAngle !== undefined) {
            var rotationAngle = navAngle - this.markerHelper.navAngle;

            markerTransformAttr = {
                transform: "r," + (rotationAngle).toString() + "," + this.wheelnav.centerX + "," + this.wheelnav.centerY,
                path: currentPath
            };
        }
        else {
            markerTransformAttr = {
                path: currentPath
            };
        }

        //Animate marker
        this.marker.animate(markerTransformAttr, this.animatetime, this.animateeffect);
        this.marker.toFront();
    }
};



///#source 1 1 /js/source/marker/wheelnav.markerPathStart.js
/* ======================================================================================= */
/* Marker path definitions.                                                                */
/* ======================================================================================= */

markerPath = function () {

    this.NullMarker = function (helper, custom) {

        if (custom === null) {
            custom = new markerPathCustomization();
        }

        helper.setBaseValue(custom);

        return {
            markerPathString: "",
            titlePosX: helper.titlePosX,
            titlePosY: helper.titlePosY
        };
    };



///#source 1 1 /js/source/marker/wheelnav.markerPath.Triangle.js

this.TriangleMarkerCustomization = function () {

    var custom = new markerPathCustomization();
    custom.arcBaseRadiusPercent = 1.09;
    custom.arcRadiusPercent = 1.2;
    custom.startRadiusPercent = 0;
    return custom;
};

this.TriangleMarker = function (helper, percent, custom) {

    if (custom === null) {
        custom = TriangleMarkerCustomization();
    }

    helper.setBaseValue(custom.markerPercent * percent, custom);

    var arcBaseRadius = helper.sliceRadius * custom.arcBaseRadiusPercent;
    var arcRadius = helper.sliceRadius * custom.arcRadiusPercent;
    var startAngle = helper.startAngle + helper.sliceAngle * 0.46;
    var endAngle = helper.startAngle + helper.sliceAngle * 0.54;

    markerPathString = [helper.MoveTo(helper.navAngle, arcBaseRadius),
                 helper.LineTo(startAngle, arcRadius),
                 helper.LineTo(endAngle, arcRadius),
                 helper.Close()];
    
    return {
        markerPathString: markerPathString,
        titlePosX: helper.titlePosX,
        titlePosY: helper.titlePosY
    };
};


///#source 1 1 /js/source/marker/wheelnav.markerPath.PieLine.js

this.PieLineMarkerCustomization = function () {

    var custom = new markerPathCustomization();
    custom.arcBaseRadiusPercent = 1;
    custom.arcRadiusPercent = 1;
    custom.startRadiusPercent = 0;
    custom.sliceAngle = null;
    return custom;
};

this.PieLineMarker = function (helper, percent, custom) {

    if (custom === null) {
        custom = PieLineMarkerCustomization();
    }

    helper.setBaseValue(custom.markerPercent * percent, custom);

    var arcBaseRadius = helper.sliceRadius * custom.arcBaseRadiusPercent;
    var arcRadius = helper.sliceRadius * custom.arcRadiusPercent;

    if (custom.sliceAngle !== null) {
        helper.startAngle = helper.navAngle - (custom.sliceAngle / 2);
        helper.endAngle = helper.navAngle + (custom.sliceAngle / 2);
    }

    markerPathString = [helper.MoveTo(helper.startAngle, arcBaseRadius),
                 helper.ArcTo(arcRadius, helper.endAngle, arcBaseRadius),
                 helper.ArcBackTo(arcRadius, helper.startAngle, arcBaseRadius),
                 helper.Close()];

    return {
        markerPathString: markerPathString,
        titlePosX: helper.titlePosX,
        titlePosY: helper.titlePosY
    };
};




///#source 1 1 /js/source/marker/wheelnav.markerPath.Menu.js

this.MenuMarkerCustomization = function () {

    var custom = new markerPathCustomization();
    custom.menuRadius = 40;
    custom.titleRadiusPercent = 0.63;
    custom.lineBaseRadiusPercent = 0;
    return custom;
};

this.MenuMarker = function (helper, percent, custom) {

    if (custom === null) {
        custom = MenuMarkerCustomization();
    }

    helper.setBaseValue(custom.markerPercent * percent, custom);

    x = helper.centerX;
    y = helper.centerY;

    helper.titleRadius = helper.wheelRadius * custom.titleRadiusPercent * percent;
    helper.setTitlePos();

    var menuRadius = custom.menuRadius * percent;
    if (percent <= 0.05) { menuRadius = 11; }

    middleTheta = helper.middleTheta;

    markerPathString = [["M", helper.titlePosX - (menuRadius * Math.cos(middleTheta)), helper.titlePosY - (menuRadius * Math.sin(middleTheta))],
                ["A", menuRadius, menuRadius, 0, 0, 1, helper.titlePosX + (menuRadius * Math.cos(middleTheta)), helper.titlePosY + (menuRadius * Math.sin(middleTheta))],
                ["A", menuRadius, menuRadius, 0, 0, 1, helper.titlePosX - (menuRadius * Math.cos(middleTheta)), helper.titlePosY - (menuRadius * Math.sin(middleTheta))],
                ["z"]];
    
    return {
        markerPathString: markerPathString,
        titlePosX: helper.titlePosX,
        titlePosY: helper.titlePosY
    };
};


///#source 1 1 /js/source/marker/wheelnav.markerPath.Line.js

this.LineMarkerCustomization = function () {

    var custom = new markerPathCustomization();
    custom.arcBaseRadiusPercent = 1.05;
    custom.arcRadiusPercent = 1.2;
    custom.startRadiusPercent = 0;
    return custom;
};

this.LineMarker = function (helper, percent, custom) {

    if (custom === null) {
        custom = LineMarkerCustomization();
    }

    helper.setBaseValue(custom.markerPercent * percent, custom);

    var arcBaseRadius = helper.sliceRadius * custom.arcBaseRadiusPercent;
    var arcRadius = helper.sliceRadius * custom.arcRadiusPercent;

    markerPathString = [helper.MoveTo(helper.navAngle, arcBaseRadius),
                 helper.LineTo(helper.navAngle, arcRadius),
                 helper.Close()];
    
    return {
        markerPathString: markerPathString,
        titlePosX: helper.titlePosX,
        titlePosY: helper.titlePosY
    };
};


///#source 1 1 /js/source/marker/wheelnav.markerPath.Drop.js

this.DropMarkerCustomization = function () {

    var custom = new markerPathCustomization();
    custom.dropBaseRadiusPercent = 0;
    custom.dropRadiusPercent = 0.15;
    return custom;
};

this.DropMarker = function (helper, percent, custom) {

    if (custom === null) {
        custom = DropMarkerCustomization();
    }

    helper.setBaseValue(custom.markerPercent * percent, custom);

    var arcBaseRadius = helper.sliceRadius * custom.dropBaseRadiusPercent;
    var startAngle = helper.startAngle + helper.sliceAngle * 0.2;
    var startAngle2 = helper.startAngle;
    var endAngle = helper.startAngle + helper.sliceAngle * 0.8;
    var endAngle2 = helper.startAngle + helper.sliceAngle;
    var dropRadius = helper.sliceRadius * custom.dropRadiusPercent;

    markerPathString = [helper.MoveTo(0, dropRadius),
        helper.ArcTo(dropRadius, 180, dropRadius),
        helper.ArcTo(dropRadius, 360, dropRadius),
        helper.MoveTo(helper.navAngle, arcBaseRadius),
                helper.LineTo(startAngle, dropRadius),
                 helper.LineTo(startAngle2, dropRadius),
                 helper.LineTo(helper.navAngle, dropRadius * 1.6),
                helper.LineTo(endAngle2, dropRadius),
                 helper.LineTo(endAngle, dropRadius),
                 helper.Close()];
    return {
        markerPathString: markerPathString,
        titlePosX: helper.titlePosX,
        titlePosY: helper.titlePosY
    };
};


///#source 1 1 /js/source/marker/wheelnav.markerPathEnd.js

    return this;
};




///#source 1 1 /js/source/wheelnav.colorPalettes.js
/* ======================================================================================== */
/* Color palettes for slices from http://www.colourlovers.com                               */
/* ======================================================================================== */
/* ======================================================================================== */
/* Documentation: http://wheelnavjs.softwaretailoring.net/documentation/colorPalettes.html  */
/* ======================================================================================== */

var colorpalette = {
    defaultpalette: new Array("#2ECC40", "#FFDC00", "#FF851B", "#FF4136", "#0074D9", "#777"),
    //defaultpalette: new Array("#258039", "#f5be41", "#f77604", "#cf3721", "#0074D9", "#777"),
    purple: new Array("#4F346B", "#623491", "#9657D6", "#AD74E7", "#CBA3F3"),
    greenred: new Array("#17B92A", "#FF3D00", "#17B92A", "#FF3D00"),
    greensilver: new Array("#1F700A", "#79CC3C", "#D4E178", "#E6D5C3", "#AC875D"),
    oceanfive: new Array("#00A0B0", "#6A4A3C", "#CC333F", "#EB6841", "#EDC951"),
    garden: new Array("#648A4F", "#2B2B29", "#DF6126", "#FFA337", "#F57C85"),
    gamebookers: new Array("#FF9900", "#DCDCDC", "#BCBCBC", "#3299BB", "#727272"),
    parrot: new Array("#D80351", "#F5D908", "#00A3EE", "#929292", "#3F3F3F"),
    pisycholand: new Array("#FF1919", "#FF5E19", "#FF9F19", "#E4FF19", "#29FF19"),
    makeLOVEnotWAR: new Array("#2C0EF0", "#B300FF", "#6751F0", "#FF006F", "#8119FF"),
    theworldismine: new Array("#F21D1D", "#FF2167", "#B521FF", "#7E2AA8", "#000000"),
    fractalloveone: new Array("#002EFF", "#00FFF7", "#00FF62", "#FFAA00", "#FFF700"),
    fractallovetwo: new Array("#FF9500", "#FF0000", "#FF00F3", "#AA00FF", "#002EFF"),
    fractallove: new Array("#002EFF", "#00FFF7", "#00FF62", "#FFAA00", "#F5D908", "#FF0000", "#FF00F3", "#AA00FF"),
    sprinkles: new Array("#272523", "#FFACAC", "#FFD700", "#00590C", "#08006D"),
    goldenyellow: new Array("#D8B597", "#8C4006", "#B6690F", "#E3C57F", "#FFEDBE"),
    hotaru: new Array("#364C4A", "#497C7F", "#92C5C0", "#858168", "#CCBCA5")
};
