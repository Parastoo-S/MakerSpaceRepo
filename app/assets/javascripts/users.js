var instructableFiles = [];
var photoFiles = [];
var tagArray = [];
var photoArray = [];

$(document).on('page:change', function(){
  console.log('change?');


  $("form#comment").on("ajax:success", function(e, data, status, xhr) {
      params = {
        username: data.username,
        user_id: data.user_id,
        user_url: data.user_url,
        content: data.comment,
        comment_id: data.comment_id,
        created_at: data.created_at
      }

      $.get('/template/comment', params, function(data){
        console.log(params.comment_id);
        $("div#comment-container").prepend(data);
        $("textarea#content").val("");

        $("a.upvote").on("ajax:success", function(e, data, status, xhr) {
          $("div.upvote-" + data.comment_id ).text(data.upvote_count); 
        });
      }, 'html');
  });

  $("a.upvote").on("ajax:success", function(e, data, status, xhr) {
    $("div.upvote-" + data.comment_id ).text(data.upvote_count); 
  });

  $("a.like").on("ajax:success", function(e, data, status, xhr) {
    $("span.like-count").text(data.like); 
  });

  photoArray = [];
  var gallery = photoSwipe();

  $("div#photo-slide").children().each(function(){
    var img = $(this);
    photoArray.push({
      src: img.attr('src'),
      w: img.data().width,
      h: img.data().height 
    });

    img.click(function(){
      gallery.options.index = img.index();
      gallery.init();
    });
  });


  $("div#show-photo").click(function(){
    gallery.init();
  });

  $("input#tag").keypress(function (e) {
    var tag = $(this);
    var val = tag.val();

    if (e.keyCode == 13) {
      tag.val("");
      if($("div#tag-container").children().length === 6){
        return false;
      }
      e.preventDefault();
      $(this).css('margin-bottom', '10px');
      tagArray.push(val);
      $.get('/template/tag', { 'tag' : val }, function(data){
        $("div#tag-container").append(data);
        var last = $("div#tag-container")[0].children.length - 1;
        var child = $("div#tag-container")[0].children[last];

        $(child).click(function(){
          var index = $(child).index();
          tagArray.splice(index, 1);
          $(child).remove();
        });

      }, 'html');
    }
  });


  $("span.menu-button").hover(function(){
    $('ul.menu').fadeIn(100);
  }, function(){
    $('ul.menu').fadeOut(100);
  });


  dragndrop.call($("div#dragndrop"));

  $("select").selectmenu({
    width: 422,
    position: { my : "left top+5", at: "left bottom" }
  });

  $("input#user_avatar").change(function(){
    readURL(this);
  });

  $("input#images_").change(function(){
    var input = $(this)[0];
    if (input.files && input.files[0]) {
      var files = $.extend(true, [], input.files);
      addPhotos(photoFiles, files, 0);
    }
    resetFormElement(input);
  });

  $("input#files_").change(function(){
    var input = $(this)[0];
    if (input.files && input.files[0]) {
      var files = $.extend(true, [], input.files);
      addFiles(instructableFiles, files, 0);
    }
    resetFormElement(input);
  });


  $("form#new_repository").submit(function(e){
    e.preventDefault();

    var _this = $(this),
        uri = _this[0].action,
        form = new FormData(_this[0]);

    for (var i = 0; i < instructableFiles.length; i++) {
      form.append("files[]", instructableFiles[i]);
    };

    for (var i = 0; i < photoFiles.length; i++) {
      form.append("images[]", photoFiles[i]);
    };

    for (var i = 0; i < tagArray.length; i++) {
      form.append("tags[]", tagArray[i]);
    };

    $.ajax({
      url: uri,
      type: "POST",
      data: form,
      dataType: 'json',
      processData: false,
      contentType: false
      }).done(function(e) {
        window.location.pathname = e.redirect_uri 
      })
      .fail(function(e) {
        console.log( 'error');
      });

  });


});


function resetFormElement(e) {
  var el = $(e);
  el.wrap('<form>').closest('form').get(0).reset();
  el.unwrap();
}

function addFiles(fileArray, files, index){
  var file = files[index];
    fileArray.push(file);
    $.get('/template/file', { 'file' : file.name }, function(data){
      $("div#file-container").append(data);
      var last = $("div#file-container")[0].children.length - 1;
      var child = $("div#file-container")[0].children[last];

      $(child.children[1]).click(function(){
        var index = $(child).index();
        fileArray.splice(index, 1);
        $(child).remove();
      });

      if( files.length !== ++index){
        addFiles(fileArray, files, index);
      }
    }, 'html');
};

function addPhotos(fileArray, files, index){
  var file = files[index];
    if (file.type.match(/image.*/)){
      fileArray.push(file);
      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function (e) {
        loadImage(e.target.result, fileArray);
        if( files.length !== ++index){
          addPhotos(fileArray, files, index);
        }
      }
    }
};

function loadImage(image, fileArray){
  var image_item = $('<div>').addClass('image-item');
  var close_button = $('<span>').addClass('image-remove');
  var img = $('<img>').attr('src', image);
  image_item.append(img);
  image_item.append(close_button);
  $('div#image-container').append(image_item);

  close_button.click(function(){
    var index = image_item.index();
    fileArray.splice(index, 1);
    image_item.remove();
  });
}

function readURL(input) {
  if (input.files && input.files[0].type.match(/image.*/) ) {

    var reader = new FileReader();
    reader.readAsDataURL(input.files[0]);

    reader.onload = function (e) {
      $('img.edit-avatar').attr('src', e.target.result);

    }
  }
}

function dragndrop(){
  $(this).on('dragenter', function(e){
    e.stopPropagation();
    e.preventDefault();
    $('div.repo-image').css('border', '2px solid #0B85A1');
  });

  $(this).on('dragover', function(e){
    e.stopPropagation();
    e.preventDefault();
  });

  $(this).on('drop', function(e){
    $('div.repo-image').css('border', '1px dashed #aaa');
    e.preventDefault();

    var input = e.originalEvent.dataTransfer;
    if (input.files && input.files[0]) {
      var files = $.extend(true, [], input.files);
      addPhotos(photoFiles, files, 0);
    }
  });

}

function photoSwipe(){
  var pswpElement = document.querySelectorAll('.pswp')[0];

  var items = photoArray;
  var options = {
      index: 0
  };

  var gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);

  return gallery;
}

