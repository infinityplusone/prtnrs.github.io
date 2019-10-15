var $ = require('jquery'),
    _ = require('lodash'),
    handlebars = require('./lib/handlebars-helpers.js'),
    $body = $('body'),
    $window = $(window);

window.PRTNRS = {

  data: {
    projects: require('../data/projects.json')
  },

  templates: {},

  processTemplates: function() {

    $.ajax({
      url: './src/templates/templates.hbs',
      type: 'get',
      dataType: 'html', 
      success: function(markup) {
        var $templates = $(markup);
        $templates.find('[data-partial-id]').each(function(i, v) {
          handlebars.registerPartial(v.getAttribute('data-partial-id'), $(v).html());
        });

        $templates.find('[data-template-id]').each(function(i, v) {
          PRTNRS.templates[v.getAttribute('data-template-id')] = handlebars.compile($(v).html());
        });
        $body.trigger('templates:processed');
      } // success
    });
  }, // processTemplates

  loadWork: function() {
    var partnerData = _.sortBy(_.filter(PRTNRS.data.projects, 'spotlight'), ['spotlight']);
    console.log(partnerData);
    var $ourWork = $('#our-work');
    $ourWork.html(PRTNRS.templates['our-work']({projects: partnerData}));
  }, // loadWork

  init: function() {

    $body
      .on('templates:processed', this.loadWork)
      .on('click', '[data-toggle="slide"]', function(e) {
        e.preventDefault();

        var $this = $(this),
            $slides = $this.closest('.work-carousel').find('.work-slides');
        
        $this.addClass('active').siblings().removeClass('active');

        $slides.css('margin-left', ($this.data('index') * -750) + 'px');

        return false;

      });

    $window.on('keydown', function(e) {
      var $active = $('.carousel-button.active'),
          $buttons = $active.parent().find('.carousel-button'),
          $next = false;

      switch(e.originalEvent.key) {
        case 'ArrowLeft':
          $next = $buttons.index($active)===0 ? $buttons.last() : $active.prev();
          break;
        case 'ArrowRight':
          $next = $buttons.index($active)===$buttons.length-1 ? $buttons.first() : $active.next();
          break;
        default:
          break;
      }

      if($next) {
        $next.trigger('click');
      }
    });

    this.processTemplates();

  }, // init

}; // PRTNRS

PRTNRS.init();