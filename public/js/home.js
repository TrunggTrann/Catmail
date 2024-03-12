// Load labels on page load
$(document).ready(() => {
    getLabels();
    
});
//Compose mail
$('#compose-form').submit(function(event) {
    // Ngăn chặn form gửi request mặc định
    event.preventDefault();
    // Tạo đối tượng FormData và thêm các giá trị của form vào đó
    var formData = new FormData(this);
    $.ajax({
        url: $(this).attr('action'),
        type: $(this).attr('method'),
        data: formData,
        contentType: false,
        processData: false,
        success: function(response) {
          // Xử lý kết quả ở đây
          $('#myModal').hide()
        },
        error: function(xhr, status, error) {
           // xử lý phản hồi lỗi
            $('#error-message').html(xhr.responseJSON); // hiển thị thông báo lỗi
            $('#errorModal').modal('show'); // hiển thị modal thông báo lỗi
        }
      });
});
// Add label
$('#createLabelForm').submit((event) => {
    event.preventDefault();
    const name = $('#labelName').val();
    const hide = $('#labelHide').val();
    const userId = $('#userId').val();


    $.post("/api/account/labels", { userId, name, hide }, (data) => {
        getLabels();
        $("#createLabelModal").hide()
    });
});

//Save draft 
$('#btnDraft').click(() => {
    const receiver = $('#receiverInput').val();
    const bcc = $('#bccInput').val();
    const subject = $('#subjectInput').val();
    const message = $('#messageInput').val();
    $.post("/api/account/drafts", { receiver, bcc, subject, message }, (data) => {
        setTimeout(() => {
            $('#flash-alert').fadeOut(2000)
        }, 1000);
    });
})

// Get labels
function getLabels() {
    const userId = $('#userId').val();
    $.post(`/api/account/labels/${userId}`, (data) => {
        const listItems = data.map(label => `
            <a href="/labels/${label._id}" id="${label._id}" class="sidebar-item label-container w-full flex flex-1 align-center text-center justify-center px-3"> 
                <div class="circle"></div> 
                <div class="label-item box-hover flex-1">
                    <div class="flex justify-between align-center py-2">
                        <div class="text-second box-hover ml-2">${label.name}</div>
                        <div class="delete-label"><i class="fa fa-trash-o"></i></div>
                    </div>
                </div>
            </a>`);
        const listItemsText = listItems.join('');

        $('#labelList').empty().append(listItemsText);
         // Add event listener to the delete button
         $('.delete-label').on('click', function(e) {
            const labelId = $(this).closest('.label-container').attr('id');
            $.ajax({
                url: `/api/account/labels/${userId}/${labelId}`,
                type: 'DELETE',
                success: function(result) {
                    // Remove the deleted label item from the UI
                    $(`#${labelId}`).remove();
                },
                error: function(error) {
                    console.log(error);
                }
            });
        });
    });
}
function renderFileorImg(array) {
    let attachImg = ''
    let attachFile = ''
    array?.map((attch) => {
        if(attch.contentType == 'image/png' || attch.contentType == 'image/jpeg') {
            attachImg += `<div class="column_img"><img src="/${attch.fileName}" style="width:100%"/></div>`
        } else {
            attachFile += `<button class="download-button mx-1">
                    <div class="docs"><svg class="css-i6dzq1" stroke-linejoin="round" stroke-linecap="round" fill="none" stroke-width="2" stroke="currentColor" height="20" width="20" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line y2="13" x2="8" y1="13" x1="16"></line><line y2="17" x2="8" y1="17" x1="16"></line><polyline points="10 9 9 9 8 9"></polyline></svg> ${attch.originalName}</div>
                    <a href="/${attch.fileName}" target="_blank" class="download">
                        <svg class="css-i6dzq1" stroke-linejoin="round" stroke-linecap="round" fill="none" stroke-width="2" stroke="currentColor" height="20" width="20" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line y2="3" x2="12" y1="15" x1="12"></line></svg>
                    </a>
                </button>`
        }
    })
    return { attachImg, attachFile }
}
$('.mail-item').on('click', function() {
    const mailId = $(this).attr('id');
    $('.mail-item').removeClass('mail-active');
    $(`#${mailId}`).addClass('mail-active')

    $.ajax({
        url: `/api/mail/${mailId}`,
        type: 'GET',
        success: function(data) {
            $("#allMails").addClass("w-2-3")
            let attachImgHtml = ''
            let attachFileHtml = ''
            let attachImgForward = ''
            let attachFileForward = ''
            let forwardHtml = ''
            let listMailUserHtml = ''
            if (data.attachments.length > 0) {
                const { attachImg, attachFile } = renderFileorImg(data.attachments)
                attachImgHtml = attachImg
                attachFileHtml = attachFile
            }
            if(data.forwardFrom) {
                if (data.forwardFrom.attachments.length > 0) {
                    const { attachImg, attachFile }= renderFileorImg(data.forwardFrom.attachments)
                    attachImgForward = attachImg
                    attachFileForward = attachFile
                }
                forwardHtml = `
                        <div class="rounded-base bg-primary p-1 relative my-3" style="">
                            <p class="absolute text-bold" style="top:-10px; left: 10px">Forward</p>
                            <p class="text-sm m-0 text-second">From date:${data.forwardFrom.date}</p>
                            <p class="my-2 text-second">${data.forwardFrom.message}</p>
                            <div class="row_img">
                                ${attachImgForward}
                            </div>
                            ${attachFileForward}
                        </div> `
            }
            if(data.userMails) {
                data.userMails.map((value) => listMailUserHtml += `<div>${value.email}</div>`)
            }
            const html = `
            <div class="p-2 h-full mail-container" id=${mailId}>
                <div class="rounded-xl ml-1 flex overflow-hidden flex-col justify-between bg-second h-full">
                    <div class="p-3 overflow-y h-full relative detail-hover">
                        <button class="absolute btn btn-close-detail">x</button>
                        <div class="flex justify-between align-center">
                            <div class="flex">
                                <div class="w-base h-base mr-1">
                                    <img class="w-full h-full rounded-full" src="${data.sender.avatar}"/>
                                </div>
                                <div class="flex flex-col justify-center">
                                    <h4 class="text-primary m-0 text-base">${data.sender.name}</h4>
                                    <p class="text-second m-0 text-sm">${data.sender.email}</p>
                                    ${data.userMails ?
                                        `<div class="flex text-second dropdown"><p class="mr-1">đến<p>
                                            <div class="dropdown">
                                                <div class="btn-group hidden-phone">
                                                    <div id="choiceIcon" data-toggle="dropdown" href="#" class="cursor-pointer" aria-expanded="false">
                                                        <i class="fa fa-angle-down" class="text-second"></i>
                                                    </div>
                                                    <div class="dropdown-menu dropdown-list">
                                                        ${listMailUserHtml}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>` : ''
                                    }
                                </div>
                            </div>
                            <div class="flex align-center"><p class="m-0 text-second text-sm mr-2">${data.date}</p><i class="fa-regular fa-bookmark-o"></i></div>
                        </div>
                        <div class="my-2">
                            <h4 class="m-0 text-primary text-xl">${data.subject}</h4>
                        </div> 
                        ${forwardHtml}
                        <p class="text-second">${data.message}</p>
                        <div class="row_img">
                            ${attachImgHtml}
                        </div>
                        ${attachFileHtml}
                    </div>
                    <div class="w-full text-second bg-primary py-2 px-3 flex justify-end">
                        <div class="text-white text-sm flex">
                            <div href="#myModalForward" data-toggle="modal" id=forward-${mailId} class="btnForward" class="ml-2 cursor-pointer flex align-center gap-2 btn-primary rounded-base px-2 py-1"><i class="fa fa-share"></i>Forward</div>
                        </div>
                    </div>
                </div>
            </div>`
            $('#detailMail').empty().append(html);
            
            //Đóng mail detail khi click vào close
            $('.btn-close-detail').on('click', () => {
                $("#allMails").removeClass("w-2-3")
                $(`#${mailId}`).removeClass('mail-active')
                $('#detailMail').empty().append('')
            });
        },
        error: function(error) {
            console.log(error);
        }
    });
})
$(document).on('click', '.btnForward', function() {
    const mailId = $(this).attr('id').split('-').pop()
    $('#parent_mail').val(`${mailId}`);
    console.log($('#parent_mail').val())
})
$('#myFormForward').submit(function(event) {
    // Ngăn chặn form gửi request mặc định
    event.preventDefault();
    // Tạo đối tượng FormData và thêm các giá trị của form vào đó
    var formData = new FormData(this);
    $.ajax({
        url: $(this).attr('action'),
        type: $(this).attr('method'),
        data: formData,
        contentType: false,
        processData: false,
        success: function(response) {
          // Xử lý kết quả ở đây
          $('#myModalForward').hide()
        },
        error: function(xhr, status, error) {
           // xử lý phản hồi lỗi
            $('#error-message').html(xhr.responseJSON); // hiển thị thông báo lỗi
            $('#errorModal').modal('show'); // hiển thị modal thông báo lỗi
        }
      });
});
// Add event listener to the click mail


$('#labelAs').on('click', function(event) {
    event.stopPropagation();
    const mailId = $(this).closest('.mail-item').attr('id')
    $("#myModalChoiceLabel").modal();
    const userId = $('#userId').val();
    $.post(`/api/account/labels/${userId}`, (data) => {
        const listItems = data.map(label => `
            <label id="${label._id}">
                <input type="radio" name="label" value="${label._id}">
                <span>${label.name}</span>
            </label>`);
        const listItemsText = listItems.join('');

        $('#allLabels').empty().append(listItemsText);
    })
    $('#addLabelMail').on('submit', function(event) {
        event.preventDefault();
        // Lấy dữ liệu form và gửi lên server
        const formData = { labelId: $('input[name="label"]:checked').val()}
        $.ajax({
            url: `/api/account/labels/mail/${mailId}`,
            type: 'POST',
            data: formData,
            success: function(data) {
                $("#myModalChoiceLabel").hide();
            },
            error: function(error) {
                console.error(error);
            }
        });
    })
})

//Logout account
$("#btnLogout").click(function() {
    $.ajax({
        type: 'POST',
        url: '/api/account/logout',
        success: function(response) {
          // Nếu thành công, reload lại trang
          window.location.href = '/login'
        },
        error: function(jqXHR, textStatus, errorThrown) {
          // Xử lý lỗi
          console.error(textStatus, errorThrown);
        }
    });
})

$("#checkAll").click(function(){

    let divsWithCheckbox = document.getElementById("checkAll");

    var items = document.getElementsByName("checkMail");
    if(divsWithCheckbox.checked){
        $(".btn-hidden").addClass('flex').removeClass("none")
        for (var i = 0; i < items.length; i++) {
            items[i].checked = true;
        }
    }
    else{
        $(".btn-hidden").addClass('none').removeClass("flex")

        for (var i = 0; i < items.length; i++) {
            items[i].checked = false;
        }
    }

})

$("#checkAll1").click(function(){

    var items = document.getElementsByName("checkMail");
    document.getElementById("checkAll").checked =true;

    for (var i = 0; i < items.length; i++) {
        items[i].checked = true;
    }
   
})

$("#checkNone").click(function(){

    var items = document.getElementsByName("checkMail");
    document.getElementById("checkAll").checked =false;

    for (var i = 0; i < items.length; i++) {
        items[i].checked = false;
    }
   
})

$("#checkRead").click(function(){

    var Parentitems = document.querySelectorAll(".bg-theme.mail-item");
    document.getElementById("checkAll").checked =true;

    for (var i = 0; i < Parentitems.length; i++) {
        var item = Parentitems[i].querySelector(".mail-checkbox");
        item.checked = true;
    }
    
   
})

$("#checkUnread").click(function(){

    var Parentitems = document.querySelectorAll(".bg-second.mail-item");
    document.getElementById("checkAll").checked =true;

    for (var i = 0; i < Parentitems.length; i++) {
        var item = Parentitems[i].querySelector(".mail-checkbox");
        item.checked = true;
    }
   
})

// Unsend mail with user
$("#unsend-mail").on('click', function(event) {
    event.stopPropagation();
    $("#unsendModal").modal();
    const mailId = $(this).closest('.mail-item').attr('id')
    //Xác nhận xóa người dùng
    $("#confirmUnsendButton").click(function() {
        $.ajax({
            url: `api/mail/unsend/${mailId}`,
            type: 'DELETE',
            success: () => {
                $(`#${mailId}`).empty();
                $(this).closest('.modal').modal('hide');
            }
        });
    });
    
})

$(".delete-mail").click(function(event){
    event.stopPropagation();
    const mailId = $(this).attr('id').split('-').pop();
    const message = true
    $.ajax({
        type: 'PUT',
        url: `api/mail/delete/${mailId}/${message}`,
        success: function(response) {
            $(`#${mailId}`).empty();
        },
        error: function(jqXHR, textStatus, errorThrown) {
          // Xử lý lỗi
          console.error(textStatus, errorThrown);
        }
    });
})

$(".remove-delete-mail").click(function(event){
    event.stopPropagation();
    const mailId = $(this).attr('id').split('-').pop();
    const message = false
    $.ajax({
        type: 'PUT',
        url: `api/mail/delete/${mailId}/${message}`,
        success: function(response) {
            $(`#${mailId}`).empty();
        },
        error: function(jqXHR, textStatus, errorThrown) {
          // Xử lý lỗi
          console.error(textStatus, errorThrown);
        }
    });
})

function deleteMail(id) {
    const message = true
    $.ajax({
        type: 'PUT',
        url: `api/mail/delete/${id}/${message}`,
        success: function(response) {
            $(`#${id}`).empty();
        },
        error: function(jqXHR, textStatus, errorThrown) {
          // Xử lý lỗi
          console.error(textStatus, errorThrown);
        }
    });
}

function readMail(id) {
    $.ajax({
        type: 'PUT',
        url: `api/mail/${id}`,
        success: function(response) {
            $(`#${id}`).removeClass('bg-second').addClass('bg-theme')
        },
        error: function(jqXHR, textStatus, errorThrown) {
          // Xử lý lỗi
          console.error(textStatus, errorThrown);
        }
    });
}


$('.deleteBtn').on('click', function(){
    var items = document.getElementsByName("checkMail");
    for (var i = 0; i < items.length; i++) {
        if(items[i].checked == true) {
            const mailId = items[i].id.split('-').pop();
            deleteMail(mailId);
        }
    }
})

$('.mail-item').on('click', function() {
    const mailId = $(this).attr('id')

    $.ajax({
        type: 'PUT',
        url: `api/mail/${mailId}`,
        success: function(response) {
            $(`#${mailId}`).removeClass('bg-second').addClass('bg-theme')
        },
        error: function(jqXHR, textStatus, errorThrown) {
          // Xử lý lỗi
          console.error(textStatus, errorThrown);
        }
    });
})
$('.markRead').on('click', function() {
    var items = document.getElementsByName("checkMail");
    for (var i = 0; i < items.length; i++) {
        if(items[i].checked == true) {
            const mailId = items[i].id.split('-').pop();
            readMail(mailId);
        }
    }
})

$('.important-mail').on('click', function(event) {
    event.stopPropagation();
    const mailId = $(this).attr('id').split('-').pop();
    
    if($(this).hasClass('yellow')){
        var message = false;
        $.ajax({
            type: 'PUT',
            url: `api/mail/important/${mailId}/${message}`,
            success: function(response) {
                $(`#important-${mailId}`).removeClass('yellow');
            },
            error: function(jqXHR, textStatus, errorThrown) {
              // Xử lý lỗi
              console.error(textStatus, errorThrown);
            }
        });
        return;
    }else {
        var message = true;
        $.ajax({
            type: 'PUT',
            url: `api/mail/important/${mailId}/${message}`,
            success: function(response) {
                $(`#important-${mailId}`).addClass('yellow');
            },
            error: function(jqXHR, textStatus, errorThrown) {
              // Xử lý lỗi
              console.error(textStatus, errorThrown);
            }
        });
        return;
    }

})


