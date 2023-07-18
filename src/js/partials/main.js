let galleryData = [];
let modalSlider = $('.modal__slider');

const initial_items = 3;
const next_items = 3;

let domain = 'https://200best.mydecor.ru';

$(document).ready(function() {
	$('.header__burger').click(function () {
		$('.header__popup').addClass('js-active')
	});
	$('.header__popup-close').click(function () {
		$('.header__popup').removeClass('js-active')
	});
    $('.header a[href^="#"]').on('click', function(event) {
        event.preventDefault();
        var target = $(this).attr('href');
        $('.header__popup').removeClass('js-active')
        $('html, body').animate({
            scrollTop: $(target).offset().top
        }, 500);
    });



    $.getJSON(domain+'/get_photos/', function(data) {
        try {
            JSON.parse(JSON.stringify(data));

            const modalSlideTemplate = '<div class="modal__slide">\
                <div class="modal__slide-background"><img src="%image%" alt="gallery"></div>\
                <div class="modal__slide-inner"><img src="%image%" alt="gallery"></div>\
                </div>';

            const galleryItemTemplate = '<div class="gallary__item item-gallary">\
                <div class="item-gallary__column"><a class="item-gallary__image" href="javascript:;" data-id="%id%"><img src="%image%" alt="gallery"></a>\
                <div class="item-gallary__body">\
                <div class="item-gallary__title">%studio%</div>\
                <div class="item-gallary__like %active%" data-id="%id%">\
                <div class="item-gallary__like-icon">\
                <svg xmlns="http://www.w3.org/2000/svg" width="46" height="39" viewBox="0 0 46 39" fill="none">\
                <path d="M43.8855 12.5967C43.8855 26.0061 22.7555 37.3838 22.7555 37.3838C22.7555 37.3838 1.62549 26.0061 1.62549 12.5967C1.62549 9.68692 2.78139 6.89632 4.83892 4.8388C6.89644 2.78127 9.68705 1.62537 12.5968 1.62537C17.1865 1.62537 21.1179 4.12642 22.7555 8.1269C24.393 4.12642 28.3244 1.62537 32.9141 1.62537C35.8239 1.62537 38.6145 2.78127 40.672 4.8388C42.7295 6.89632 43.8855 9.68692 43.8855 12.5967Z" fill="#F70042"></path>\
                <path d="M32.914 0C28.7185 0 25.0451 1.80418 22.7554 4.8538C20.4656 1.80418 16.7922 0 12.5967 0C9.25702 0.00376426 6.05518 1.33212 3.69365 3.69365C1.33212 6.05518 0.00376426 9.25702 0 12.5967C0 26.8188 21.0873 38.3306 21.9853 38.806C22.222 38.9334 22.4866 39 22.7554 39C23.0241 39 23.2887 38.9334 23.5254 38.806C24.4234 38.3306 45.5107 26.8188 45.5107 12.5967C45.507 9.25702 44.1786 6.05518 41.8171 3.69365C39.4556 1.33212 36.2537 0.00376426 32.914 0ZM22.7554 35.5146C19.0454 33.3529 3.25077 23.5051 3.25077 12.5967C3.25399 10.119 4.23969 7.7437 5.9917 5.9917C7.7437 4.23969 10.119 3.25399 12.5967 3.25077C16.5484 3.25077 19.8662 5.35564 21.2519 8.73643C21.3743 9.03455 21.5827 9.28953 21.8504 9.46897C22.1181 9.64842 22.4331 9.74423 22.7554 9.74423C23.0777 9.74423 23.3927 9.64842 23.6604 9.46897C23.9281 9.28953 24.1364 9.03455 24.2588 8.73643C25.6445 5.34954 28.9623 3.25077 32.914 3.25077C35.3917 3.25399 37.767 4.23969 39.519 5.9917C41.271 7.7437 42.2567 10.119 42.26 12.5967C42.26 23.4888 26.4612 33.3508 22.7554 35.5146Z" fill="#F70042"></path>\
                </svg>\
                </div>\
                <div class="item-gallary__like-count">%likes%</div>\
                </div>\
                </div>\
                </div>\
                </div>';

            let galleryHtml = '';

            $.each(data, function(key, value) {
                galleryData[parseInt(value.id)] = value;
                let galleryItemHtml = galleryItemTemplate;
                galleryItemHtml = galleryItemHtml.replace(/%id%/g, value.id);
                galleryItemHtml = galleryItemHtml.replace('%image%', domain + value.image[0]);
                galleryItemHtml = galleryItemHtml.replace('%studio%', (value.studio !== undefined) ? value.studio : value.name);
                galleryItemHtml = galleryItemHtml.replace('%likes%', value.likes);
                galleryItemHtml = galleryItemHtml.replace('%active%',  (value.checked) ? 'active sended' : '');
                galleryHtml += galleryItemHtml;

            });

            $("#gallary__grid").append(galleryHtml);

            $('.item-gallary__like').on('click', function () {
                event.preventDefault();
                let button = $(this);
                if (!button.hasClass('sended')){
                    button.addClass('sended');
                    let id = parseInt(button.data('id'));
                    if (id > 0){
                        $.ajax({
                            type: "POST",
                            url: domain +"/add_like/",
                            data: { id : id },
                            success: function(data) {
                                try {
                                    jsonResponse = $.parseJSON(data);
                                    if (jsonResponse.hasOwnProperty('error') && jsonResponse.error !== '') {
                                        alert(jsonResponse.error);
                                    } else {
                                        button.addClass('active');
                                        let count = parseInt(button.find('.item-gallary__like-count').text());
                                        button.find('.item-gallary__like-count').text(count+1);
                                    }
                                } catch(e) {
                                    button.removeClass('sended');
                                }
                            },
                            error: function () {
                                console.log('Ошибка like');
                                button.removeClass('sended');
                            }
                        });
                    }
                }
            });

            function showNextItems(pagination) {
                let itemsMax = $('.visible_item').length;
                let itemsCount = 0;
                $('.visible_item').each(function () {
                    if (itemsCount < pagination) {
                        $(this).removeClass('visible_item').slideDown(300);
                        itemsCount++;
                    }
                });
                if (itemsCount >= itemsMax) {
                    $('#gallary__show-more').hide();
                }
            }

            function hideItems(pagination) {
                let itemsMax = $('.gallary__item').length;
                let itemsCount = 0;
                $('.gallary__item').each(function () {
                    if (itemsCount >= pagination) {
                        $(this).addClass('visible_item').hide();
                    }
                    itemsCount++;
                });
                if (itemsCount < itemsMax || initial_items >= itemsMax) {
                    $('#gallary__show-more').hide();
                }
            }

            $('#gallary__show-more').on('click', function (e) {
                e.preventDefault();
                showNextItems(next_items);
            });

            hideItems(initial_items);


            $('.item-gallary__image').on('click',function (){
                event.preventDefault();
                let id = parseInt($(this).data('id'));
                if (galleryData.hasOwnProperty(id)) {
                    let name = galleryData[id].name;
                    let studio = galleryData[id].studio;
                    let desc = galleryData[id].desc ;
                    let images = galleryData[id].image;
                    while (modalSlider.slick('getSlick').$slides.length > 0) {
                        modalSlider.slick('slickRemove', 0);
                    }
                    if (images.length > 0){
                        images.forEach(function (elem){
                            let modalSlideHtml = modalSlideTemplate;
                            modalSlideHtml = modalSlideHtml.replace(/%image%/g, domain +  elem);
                            modalSlider.slick('slickAdd',modalSlideHtml);
                        });
                    }
                    if (studio !== undefined) {
                        $('.modal__studio').text(studio).show();
                    } else {
                        $('.modal__studio').text('').hide();
                    }
                    $('.modal__name').text(name);
                    $('.modal__text').text(desc);
                    new Fancybox([
                        {
                            src: "#modal",
                            type: "inline",
                        },
                    ]);
                    setTimeout(function (){
                        $('.modal__slider').slick('refresh');
                    },100)
                }
            });

            $('.modal__close').on('click',function (){
                event.preventDefault();
                Fancybox.close();
            });

        } catch (e) {
            console.error('Ошибка инициализации галереи');
        }
    });


    modalSlider.slick({
        dots: false,
        infinite: true,
        speed: 300,
        slidesToShow: 1,
        slidesToScroll: 1,
        adaptiveHeight: true,
        fade: true,
        prevArrow: '<button type="button" class="modal__btn modal__btn--prev"></button>',
        nextArrow: '<button type="button" class="modal__btn modal__btn--next"></button>',
    });


    $('.feedback__form').on('submit',function (){
        event.preventDefault();
        let form = $(this);
        let formData = form.serialize();


        $.ajax({
            url: domain + '/save_photo/',
            type: 'POST',
            data: formData,
            success: function(data) {
                try {
                    jsonResponse = $.parseJSON(data);
                    if (jsonResponse.hasOwnProperty('error') && jsonResponse.error !== '') {
                        $('.alert__title').text('Ошибка').addClass('error');
                        $('.alert__text').text(jsonResponse.error);
                        new Fancybox([
                            {
                                src: "#alert",
                                type: "inline",
                            },
                        ]);
                    } else {
                        form[0].reset();
                        $('.alert__title').text('Успешно').removeClass('error');
                        $('.alert__text').text('Ваши данные сохранены');
                        new Fancybox([
                            {
                                src: "#alert",
                                type: "inline",
                            },
                        ]);
                    }
                } catch(e) {
                    alert('Ошибка обработки ответа от сервера');
                }
            },
            error: function () {
                alert('Ошибка отправки формы');
            }
        });
    });

    $('.alert__close').on('click',function (){
        event.preventDefault();
        Fancybox.close();
    });
});




