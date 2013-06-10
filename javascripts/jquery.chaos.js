/*!
 * jQuery Chaos
 * https://github.com/tulios/jquery.chaos
 * version: 0.1.0
 */

;(function ($, window, document, undefined) {

  $.fn.chaos = function(opts) {
    var container = $(this);

    if (!container.data("chaosInstance")) {
      var opts = $.extend({}, $.fn.chaos.options, opts);
      var instance = new Chaos(container, opts);
      container.data("chaosInstance", instance);
      return instance;
    }

    return container.data("chaosInstance");
  };

  $.fn.chaos.options = {
    elementSelector: ".atom",
    effectClass: "effect",
    padding: 10,
    columnWidth: null,
    beforeInitialization: function(element) {},
    beforeElementAnimation: function(element, opts) {},
    beforeAnimation: function() {},
    afterAnimation: function() {},
    animateFunction: null,
    animateFallbackFunction: null
  };

  var Chaos = function (container, opts) {
    this.container = container;
    this.opts = opts;
    this._init();
  };

  Chaos.prototype = {

    setup: function(elements) {
      var self = this;
      var elements = elements || this._getElements();

      for (var i = 0; i < elements.length; i++) {
        var element = $(elements.get(i));

        if (!element.data("chaos")) {
          element.data("chaos", {});
        }

        var props = element.data("chaos");

        props.originalLeft = this._pxToInt(element.css("left"));
        props.originalTop = this._pxToInt(element.css("top"));

        this.opts.beforeInitialization(element);

        this._applyTransform(element, {left: props.originalLeft, top: props.originalTop});
        element.css({left: 0, top: 0});
      }

      this._calculateColumns(this._getElements());
      return this;
    },

    updateOptions: function(opts) {
      this.opts = $.extend({}, this.opts, opts);
      this._calculateColumns(this._getElements());
    },

    original: function(params) {
      var params = $.extend({}, params);
      var elementsUniverse = this._getElements();
      elementsUniverse.addClass(this.opts.effectClass);

      var elements = params.selector ? $(params.selector, this.container) : elementsUniverse;
      var callbackObj = {afterElementAnimation: params.afterElementAnimation};

      if (elements.length == 0) {
        return;
      }

      this._animate(params, function() {
        for (var i = 0; i < elements.length; i++) {
          var element = $(elements.get(i));
          var props = element.data("chaos");
          this._applyTransform(element, $.extend({left: props.originalLeft, top: props.originalTop}, callbackObj));
        }
        this.container.css("height", this.containerOriginalHeight + "px");
      });
    },

    organize: function(params) {
      var style = "organize";
      var params = $.extend({}, params);
      var reverse = params.order === "reverse";

      var elementsUniverse = this._getElements();
      elementsUniverse.addClass(this.opts.effectClass);

      var elements = params.selector ? $(params.selector, this.container) : elementsUniverse;
      var callbackObj = {afterElementAnimation: params.afterElementAnimation};

      if (elements.length == 0) {
        return;
      }

      if (reverse) {
        elements = $(elements.get().reverse());
      }

      elements.addClass(this.opts.effectClass);

      this._animate(params, function() {
        for (var i = 0; i < elements.length; i++) {
          var element = $(elements.get(i));
          this._applyTransform(element, $.extend(this._calculatePosition(element), callbackObj));
        }
        this._adjustContainer();
        this._resetY();
      });
    },

    _init: function() {
      if (!Modernizr.csstransforms3d) {
        this._fallback = true;
      }

      var elements = this._getElements();
      this.containerOriginalHeight = this.container.height();
      this.container.addClass(this.opts.effectClass);
      this.setup(elements);
    },

    _resetY: function() {
      var i = this.columns;
      this.colYs = [];
      while (i--) {
        this.colYs.push(0);
      }
    },

    _adjustContainer: function() {
      var height = Math.max.apply(Math, this.colYs) + this.opts.padding;
      this.container.css("height", height + "px");
    },

    _calculateColumns: function(elements) {
      this.minColumnWidth = (this.opts.columnWidth || this._calculateMinWidth(elements)) + this.opts.padding;
      this.maxColumns = Math.floor(this.container.width() / this.minColumnWidth);

      this.columns = Math.floor(this.container.width() / this.minColumnWidth);
      this.columns = Math.max(this.columns, 1);
      this._resetY();
    },

    _calculateMinWidth: function(elements) {
      var widths = [];
      for (var i = 0; i < elements.length; i++) {
        widths.push($(elements.get(i)).outerWidth(true));
      }
      return Math.min.apply(Math, widths);
    },

    // Borrowed and adapted from http://masonry.desandro.com/jquery.masonry.js layout logic
    _calculatePosition: function(element) {
      var colSpan, groupCount, groupY, groupColY;

      var elementWidth = element.outerWidth(true) + this.opts.padding;
      var elementHeight = element.outerHeight(true) + this.opts.padding;

      //how many columns does this brick span
      colSpan = Math.ceil(elementWidth / this.minColumnWidth);
      colSpan = Math.min(colSpan, this.maxColumns);

      if (colSpan === 1) {
        // if brick spans only one column, just like singleMode
        groupY = this.colYs;

      } else {
        // brick spans more than one column
        // how many different places could this brick fit horizontally
        groupCount = this.maxColumns + 1 - colSpan;
        groupY = [];

        // for each group potential horizontal position
        for (var j = 0; j < groupCount; j++) {
          // make an array of colY values for that one group
          groupColY = this.colYs.slice(j, j + colSpan);
          // and get the max value of the array
          groupY[j] = Math.max.apply(Math, groupColY);
        }
      }

      // get the minimum Y value from the columns
      var minimumY = Math.min.apply(Math, groupY);
      var shortCol = 0;

      // Find index of short column, the first from the left
      var len = groupY.length;
      for (var i = 0; i < len; i++) {
        if (groupY[i] === minimumY) {
          shortCol = i;
          break;
        }
      }

      // apply setHeight to necessary columns
      var setHeight = minimumY + elementHeight;
      var setSpan = this.columns + 1 - len;
      for (var i = 0; i < setSpan; i++) {
        this.colYs[shortCol + i] = setHeight;
      }

      return {
        top: minimumY + this.opts.padding,
        left: this.minColumnWidth * shortCol + this.opts.padding
      };
    },

    _animate: function(params, callback) {
      this.opts.beforeAnimation();
      if (params.beforeAnimation) {
        params.beforeAnimation();
      }

      callback.apply(this);

      this.opts.afterAnimation();
      if (params.afterAnimation) {
        params.afterAnimation();
      }
    },

    _applyTransform: function(element, opts) {
      this.opts.beforeElementAnimation(element, opts);

      if (this._fallback) {
        this._fallbackTransform(element, opts);

      } else {
        this._cssTransform(element, opts);
      }
    },

    _fallbackTransform: function(element, opts) {
      if (!this.opts.animateFallbackFunction) {
        element.animate(opts, function() {
          if (opts.afterElementAnimation) {
            opts.afterElementAnimation(element);
          }
        });

      } else {
        this.opts.animateFallbackFunction(element, opts);
      }
    },

    _cssTransform: function(element, opts) {
      if (!this.opts.animateFunction) {

        $(element).on("webkitTransitionEnd mozTransitionEnd oTransitionEnd msTransitionEnd transitionend", function(){
          if (opts.afterElementAnimation) {
            opts.afterElementAnimation(element);
            $(element).off("webkitTransitionEnd mozTransitionEnd oTransitionEnd msTransitionEnd transitionend");
          }
        });

        $(element).css({
          "-webkit-transform": "translate3d(" + opts.left + "px, " + opts.top +"px, 0px)",
          "-moz-transform": "translate3d(" + opts.left + "px, " + opts.top +"px, 0px)",
          "-o-transform": "translate3d(" + opts.left + "px, " + opts.top +"px, 0px)",
          "-ms-transform": "translate3d(" + opts.left + "px, " + opts.top +"px, 0px)",
          "transform": "translate3d(" + opts.left + "px, " + opts.top +"px, 0px)"
        });

      } else {
        this.opts.animateFunction(element, opts);
      }
    },

    _getElements: function() {
      return $(this.opts.elementSelector, this.container);
    },

    _pxToInt: function(px) {
      return parseInt(px.replace(/px$/, ""), 10) || 0;
    }

  };

})(jQuery, window, document, undefined);
