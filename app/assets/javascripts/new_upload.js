$(function () {
  let imageCount = $(".sell-form__image").data('image_count');
  let imageList = [];

  $(document).on('change', '#item_item_image_image', function () {
    const files = $.extend(true, {}, $(this).prop('files'));

    manageFiles(files);
    $(this).val("");
  });

  $(document).on('click', '#dropbox', function () {
    $("#item_item_image_image").click();
  });

  $(document).on('click', '.upload-item__container__button__delete', function () {
    const id = $(this).data('id');

    imageList[id] = null;
    imageCount--;
    $("#uploadItem-" + id).empty();
    $("#dropbox").css("display", "block");
  });

  $(document).on('click', '.stored-item__container__button__delete', function () {
    const id = $(this).data('id');

    $.ajax({
      type: "delete",
      url: "/item_images/" + id,
      data: { id: id },
      dataType: "json",
    }).then(function () {
      imageCount--;
      $("#storedItem-" + id).empty();
      $("#dropbox").css("display", "block");
    })

  });

  $(document).on('dragover', '#dropbox', function (event) {
    event.stopPropagation();
    event.preventDefault();
  });

  $(document).on('drop', '#dropbox', function (event) {
    event.preventDefault();
    const files = event.originalEvent.dataTransfer.files;
    manageFiles(files);
  });

  //送信機能
  $(document).on('click', '#newItemSubmitButton', function (event) {
    event.preventDefault();

    $("#newItemSubmitButton").prop('disabled', true);

    $.ajaxPrefilter(function(options, originalOptions, jqXHR){
      var token;
      if (!options.crossDomain){
        token = $('meta[name="csrf-token"]').attr('content');

        if (token){
          return jqXHR.setRequestHeader('X-CSRF-Token', token);
        }
      }
    });

    let formData = new FormData();

    let images = imageList.filter(function (image) {
      return image != null;
    });

    images.map(function (image, index) {
      formData.append(`item[item_images_attributes][${index}][image]`, image);
    });

    if ($("#item_sub_sub_category_id").val()) {
      formData.append("item[category_id]", $("#item_sub_sub_category_id").val());
    }
    else if ($("#item_sub_category_id").val()) {
      formData.append("item[category_id]", $("#item_sub_category_id").val());
    }
    else if ($("#item_category_id").val()) {
      formData.append("item[category_id]", $("#item_category_id").val());
    }
    else {
      formData.append("item[category_id]", "");
    }

    if ($("#item_brand_id").val()) {
      formData.append("item[brand_id]", $("#item_brand_id").val());
    }

    formData.append("item[name]", $("#nameField").val());
    formData.append("item[comment]", $("#commentField").val());
    formData.append("item[condition]", $("#item_condition").val());
    formData.append("item[shipping_fee]", $("#item_shipping_fee").val());
    formData.append("item[prefecture_id]", $("#item_prefecture_id").val());
    formData.append("item[days_to_ship]", $("#item_days_to_ship").val());
    formData.append("item[price]", $("#priceField").val());

    let type = 'POST';
    if ($("[name=_method]").length){
      type = $("[name=_method]").val();
    }
    const url = $("#itemForm").attr('action');
    $.ajax({
      type: type,
      url: url,
      data: formData,
      dataType: "json",
      processData: false,
      contentType: false,
      beforeSend: function () {
        $("#newItemSubmitButton").val("");
        $("#newItemSubmitButton").css("background-color", "#ccc");
        $("#loadIcon").css("display", "block");
      },
    }).done(function (data) {
      location.href = "/items/" + data.id;
    }).fail(function (response) {
      showError();
    }).always(function () {
      $("#newItemSubmitButton").val("出品する");
      $("#newItemSubmitButton").css("background-color", "#e62017");
      $("#loadIcon").css("display", "none");
      $("#newItemSubmitButton").prop('disabled', false);
    });
  });

  function addPreviewToUploadField(image, index) {
    const html = `<div class="upload-item" id="uploadItem-${index}">
                    <div class="upload-item__container">
                      <figure><img src="${image}" class="upload-item__container__image" id="uploadImage-${index}"/></figure>
                      <div class="upload-item__container__button" id="upButton-${index}">
                        <a class="upload-item__container__button__edit" data-id="${index}">編集</a>
                        <a class="upload-item__container__button__delete" data-id="${index}">削除</a>
                      </div>
                    </div>
                  </div>`

    $("#uploadField").prepend(html);
  }

  function manageFiles(files) {
    const fileLength = files.length;
    imageCount += fileLength;

    for (let i = 0; i < fileLength; i++){
      if (files[i].type !== 'image/jpeg' && files[i].type !== 'image/png') {
        $(".sell-form__image__error").append(`<p>ファイル形式はjpeg、またはpngが使用できます。</p>`);

        return false;
      }
    }

    if (imageCount > 10) {
      imageCount -= fileLength;
      $(".sell-form__image").append(`<p>アップロード出来る画像は10枚までです。</p>`);
      return false;
    }
    else if (imageCount == 10) {
      $("#dropbox").css("display", "none");
    }
    else {
      $("#dropbox").css("display", "block");
    }

    $(".sell-form__image__error").empty();

    for (let i = 0; i < fileLength; i++){
      const reader = new FileReader();

      reader.onload = function () {
        imageList.push(files[i]);
        addPreviewToUploadField(reader.result, imageList.length - 1);
      }

      reader.readAsDataURL(files[i]);
    }
  }

  //未入力チェック
  function showError() {
    if (imageCount < 1) {
      $(".sell-form__image__error").html(`<p>画像がありません</p>`);
    }
    else {
      $(".sell-form__image__error").empty();
    }

    if ($("#nameField").val()) {
      $(".sell-form__summary__name__error").empty();
    }
    else {
      $(".sell-form__summary__name__error").html(`<p>入力してください</p>`);
    }

    if ($("#commentField").val()) {
      $(".sell-form__summary__comment__error").empty();
    }
    else {
      $(".sell-form__summary__comment__error").html(`<p>入力してください</p>`);
    }

    if ($("#item_category_id").val()) {
      $(".sell-form__detail__select-box__category__error").empty();
    }
    else {
      $(".sell-form__detail__select-box__category__error").html(`<p>選択してください</p>`);
    }

    if ($("#item_condition").val()) {
      $(".sell-form__detail__select-box__condition__error").empty();
    }
    else {
      $(".sell-form__detail__select-box__condition__error").html(`<p>選択してください</p>`);
    }

    if ($("#item_shipping_fee").val()) {
      $(".sell-form__shipping__select-box__fee__error").empty();
    }
    else {
      $(".sell-form__shipping__select-box__fee__error").html(`<p>選択してください</p>`);
    }

    if ($("#item_prefecture_id").val()) {
      $(".sell-form__shipping__select-box__region__error").empty();
    }
    else {
      $(".sell-form__shipping__select-box__region__error").html(`<p>選択してください</p>`);
    }

    if ($("#item_days_to_ship").val()) {
      $(".sell-form__shipping__select-box__days__error").empty();
    }
    else {
      $(".sell-form__shipping__select-box__days__error").html(`<p>選択してください</p>`);
    }

    if ($("#profitField").text() === "-") {
      $(".sell-form__price__select-box__price-wrap__error").html(`<p>300以上9999999以下で入力してください</p>`);
    }
    else {
      $(".sell-form__price__select-box__price-wrap__error").empty();
    }
  }
});
