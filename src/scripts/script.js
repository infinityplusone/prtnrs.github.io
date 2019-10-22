var $ = require('jquery'),
    _ = require('lodash'),
    handlebars = require('./lib/handlebars-helpers.js'),
    $body = $('body'),
    $window = $(window);

require('jquery-touchSwipe');
require('./lib/email.js');

window.$ = $;

handlebars.registerPartial('list', require('../templates/list.partial.hbs'));
// handlebars.registerPartial('work-slide', require('../templates/work-slide.partial.hbs'));
// handlebars.registerPartial('work-card', require('../templates/work-card.partial.hbs'));

window.PRTNRS = {
  modalTimer: null,
  scrollTimer: null,

  data: {
    projects: require('../data/projects.json'),
  },

  elems: {
    $modal: false,
  },

  templates: {
    'work-modal': require('../templates/work-modal.hbs'),
  },

  loadWork: function() {
    // var partnerData = _.sortBy(_.filter(PRTNRS.data.projects, 'spotlight'), ['spotlight']);
    var $ourWork = $('#work-carousel');
    // $ourWork.html(PRTNRS.templates['work-carousel']({projects: partnerData}));

    PRTNRS.elems.$buttons = $ourWork.find('.carousel-button');
    PRTNRS.elems.$slides = $ourWork.find('.work-slide');
    PRTNRS.elems.$slides.swipe({
      swipeLeft: PRTNRS.onKeyDown,
      swipeRight: PRTNRS.onKeyDown
    });

    PRTNRS.moveSlide(PRTNRS.elems.$buttons.first(), true);
  }, // loadWork

  moveSlide: function($next, first) {
    if($next && !PRTNRS.elems.$modal) {
      $next.trigger('click').find('a').focus();
      $body.removeClass('show-modal');
    }
    if(!first) {
      $('html').animate({scrollTop: $('#our-work').offset().top + 'px'});
    }
  }, // moveSlide

  closeModal: function(e) {
    clearInterval(PRTNRS.modalTimer);
    if(e) {
      e.preventDefault();
    }
    if(PRTNRS.elems.$modal) {
      PRTNRS.elems.$modal.removeClass('in');
      $body.removeClass('show-modal');
      $body.find('.work-slide-overlay').blur();
      PRTNRS.elems.$modal.data('$elem').focus();
      setTimeout(function() {
        $('.modal').remove();
        // PRTNRS.elems.$modal.remove();
        PRTNRS.elems.$modal = false;
      }, 250);
    }
    document.getElementById('our-work').scrollIntoView();
    return false;
  }, // closeModal

  toggleModal: function(e) {
    e.preventDefault();
    var project = _.find(PRTNRS.data.projects, {project: this.getAttribute('data-project')}),
        $modal = $(PRTNRS.templates['work-modal'](project)),
        $elem = $(this);

    $elem.after($modal);
    $modal.data('$elem', $elem);
    $modal.on('scroll', function() {
      clearTimeout(PRTNRS.scrollTimer);
      var $thisModal = $(this),
          $close = $thisModal.find('.modal-close');
      $close.css('opacity', 0);
      PRTNRS.scrollTimer = setTimeout(function() {
        clearTimeout(PRTNRS.scrollTimer);
        $close.css('opacity', '').css('top', $thisModal.scrollTop());
      }, 250);
    });
    // $modal.find('a').first().prev().focus();
    setTimeout(function() {
      $modal.addClass('in').siblings('.modal').remove();
      $body.addClass('show-modal');
      PRTNRS.elems.$modal = $modal;
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
    else {
      $slides.css('margin-left', '');
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
        $body.focus();
        break;
        break;
      default:
        break;
    }
  }, // onKeyDown

  init: function() {

    this.loadWork();

    $body
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