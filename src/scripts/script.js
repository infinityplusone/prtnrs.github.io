var $ = require('jquery'),
    _ = require('lodash'),
    handlebars = require('./lib/handlebars-helpers.js'),
    $body = $('body'),
    $window = $(window);

require('jquery-touchSwipe');
require('./lib/email.js');

window.$ = $;

handlebars.registerPartial('list', require('../templates/list.partial.hbs'));
handlebars.registerPartial('work-slide', require('../templates/work-slide.partial.hbs'));
handlebars.registerPartial('work-card', require('../templates/work-card.partial.hbs'));

window.PRTNRS = {

  autoScroll: null,

  data: {
    projects: require('../data/projects.json')
  },

  elems: {},
  templates: {
    'work-carousel': require('../templates/work-carousel.hbs'),
    'work-modal': require('../templates/work-modal.hbs'),
  },

  loadWork: function() {
    var partnerData = _.sortBy(_.filter(PRTNRS.data.projects, 'spotlight'), ['spotlight']);
    var $ourWork = $('#our-work');
    $ourWork.html(PRTNRS.templates['work-carousel']({projects: partnerData}));

    PRTNRS.elems.$buttons = $ourWork.find('.carousel-button');
    PRTNRS.elems.$slides = $ourWork.find('.work-slide');
    PRTNRS.elems.$slides.swipe({
      swipeLeft: PRTNRS.onKeyDown,
      swipeRight: PRTNRS.onKeyDown
    });

    PRTNRS.moveSlide(PRTNRS.elems.$buttons.first());
  }, // loadWork

  moveSlide: function($next) {
    if($next) {
      $next.trigger('click').find('a').focus();
      $body.removeClass('show-modal');
    }
  }, // moveSlide

  closeModal: function(e) {
    if(e) {
      e.preventDefault();
    }
    $('.modal').removeClass('in');
    $body.find('.work-slide.active a').focus();
    $body.removeClass('show-modal');
    return false;
  }, // closeModal

  toggleModal: function(e) {
    clearTimeout(PRTNRS.autoScroll);
    e.preventDefault();
    var project = _.find(PRTNRS.data.projects, {project: this.getAttribute('data-project')});
    var $modal = $(PRTNRS.templates['work-modal'](project));
    $body.append($modal).addClass('show-modal');
    $modal.find('a').first().prev().focus();
    setTimeout(function() {
      $modal.addClass('in').siblings('.modal').remove();
    }, 250);
    return false;
  }, // toggleModal

  toggleSlide: function(e) {
    e.preventDefault();
    if(window.innerWidth>667) {
      return false;
    }

    var $this = $(this),
        $slides = $this.closest('.work-carousel').find('.work-slides');
    
    $this.addClass('active').siblings().removeClass('active');

    $slides.css('margin-left', '-' + ($this.data('index') * window.innerWidth) + 'px');
    $($this.attr('href')).addClass('active').focus().siblings().removeClass('active');

    PRTNRS.closeModal();
    return false;

  }, // toggleSlide

  onResize: function(e) {
    var $slides = $('.work-carousel').find('.work-slides');
    if(window.innerWidth<668) {
      $slides.css('margin-left', '-' + ($slides.find('.active').data('index') * window.innerWidth) + 'px');
    }
  }, // onResize

  onKeyDown: function(e, key) {
    var $active = PRTNRS.elems.$buttons.filter('.active').first();

    if(!key) {
      key = e.type==='keydown' ? e.originalEvent.key : this.getAttribute('data-key');
    }
    else {
      $body.removeClass('show-modal');
      e.preventDefault();
      e.stopImmediatePropagation();
    }
    switch(key) {
      case 'right': 
      case 'ArrowLeft':
        PRTNRS.moveSlide(PRTNRS.elems.$buttons.index($active)===0 ? PRTNRS.elems.$buttons.last() : $active.prev());
        break;
      case 'left':
      case 'ArrowRight':
        PRTNRS.moveSlide(PRTNRS.elems.$buttons.index($active)===PRTNRS.elems.$buttons.length-1 ? PRTNRS.elems.$buttons.first() : $active.next());
        break;
      case 'Escape':
        PRTNRS.closeModal(e);
        break;
        break;
      default:
        break;
    }
  }, // onKeyDown

  init: function() {

    this.loadWork();

    $body
      .on('scroll', '.modal, .modal-content', function() {
        console.log('hi');
        $('.modal-close').css('position', 'static');
        setTimeout(function() {
          $('.modal-close').css('position', 'fixed');
        }, 100);
      })

      .on('click', '[data-toggle="slide"][data-key]', this.onKeyDown)
      .on('click focus', '[data-toggle="slide"]', this.toggleSlide)
      .on('click', '[data-toggle="modal"]', this.toggleModal)
      .on('click', '[data-close="modal"]', this.closeModal);
    $window
      .on('resize', this.onResize)
      .on('keydown', this.onKeyDown);

  }, // init

}; // PRTNRS

PRTNRS.init();