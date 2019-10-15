var $ = require('jquery'),
    _ = require('lodash'),
    handlebars = require('./lib/handlebars-helpers.js'),
    $body = $('body'),
    $window = $(window);

window.PRTNRS = {

  autoScroll: null,

  data: {
    projects: require('../data/projects.json')
  },

  elems: {},
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
    var $ourWork = $('#our-work');
    $ourWork.html(PRTNRS.templates['our-work']({projects: partnerData}));

    PRTNRS.elems.$buttons = $ourWork.find('.carousel-button');
    PRTNRS.elems.$slides = $ourWork.find('.work-slide');
    PRTNRS.moveSlide(PRTNRS.elems.$buttons.first());
  }, // loadWork

  moveSlide: function($next) {
    var $modal = $('.modal.in');

    if($next) {
      $next.trigger('click');
      if($modal.length) {
        $('.work-slide.active').trigger('click');
      }
      else {
        PRTNRS.autoScroll = setTimeout(function() {
          PRTNRS.moveSlide({originalEvent: { key: 'ArrowRight' }});
        }, 7500);
      }
    }
  }, // moveSlide

  closeModal: function(e) {
    e.preventDefault();
    $('.modal').removeClass('in');
    $body.removeClass('show-modal');
    PRTNRS.moveSlide(PRTNRS.elems.$buttons.filter('.active').first());
    return false;
  }, // closeModal

  toggleModal: function(e) {
    clearTimeout(PRTNRS.autoScroll);
    e.preventDefault();
    var project = _.find(PRTNRS.data.projects, {project: this.getAttribute('data-project')});
    var $modal = $(PRTNRS.templates['work-modal'](project));
    $body.append($modal).addClass('show-modal');
    setTimeout(function() {
      $modal.addClass('in').siblings('.modal').remove();
    }, 250);
    return false;
  }, // toggleModal

  toggleSlide: function(e) {
    e.preventDefault();

    var $this = $(this),
        $slides = $this.closest('.work-carousel').find('.work-slides'),
        slideWidth = PRTNRS.elems.$slides.first().width();
    
    $this.addClass('active').siblings().removeClass('active');

    $slides.css('margin-left', '-' + ($this.data('index') * (slideWidth + 30)) + 'px');
    $($this.attr('href')).addClass('active').siblings().removeClass('active');

    $('.modal.in').removeClass('in');
    return false;

  }, // toggleSlide

  onKeyDown: function(e) {
    clearTimeout(PRTNRS.autoScroll);
    var key = e.originalEvent.key,
        $active = PRTNRS.elems.$buttons.filter('.active').first();

    switch(key) {
      case 'ArrowLeft':
        PRTNRS.moveSlide(PRTNRS.elems.$buttons.index($active)===0 ? PRTNRS.elems.$buttons.last() : $active.prev());
        break;
      case 'ArrowRight':
        PRTNRS.moveSlide(PRTNRS.elems.$buttons.index($active)===PRTNRS.elems.$buttons.length-1 ? PRTNRS.elems.$buttons.first() : $active.next());
        break;
      case 'Enter':
        PRTNRS.elems.$slides.filter('.active').trigger('click');
        break;
      case 'Escape':
        PRTNRS.closeModal(e);
        break;
      default:
        break;
    }

  }, // onKeyDown

  init: function() {

    $body
      .on('click', '[data-toggle="slide"]', this.toggleSlide)
      .on('click', '[data-toggle="modal"]', this.toggleModal)
      .on('click', '[data-close="modal"]', this.closeModal)
      .on('templates:processed', this.loadWork);

    $window.on('keydown', this.onKeyDown);

    this.processTemplates();

  }, // init

}; // PRTNRS

PRTNRS.init();