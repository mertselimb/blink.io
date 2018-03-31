var socket = io();

var amount = '';

function scroll() {
    $('.scrollDown').animate({
        scrollTop: amount
    }, 100, 'linear', function () {
        if (amount != '') {
            scroll();
        }
    });
}
$('.scrollDown').hover(function () {
    amount = '+=20';
    scroll();
});