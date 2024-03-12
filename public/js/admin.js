// Load bad keywords on page load
// Load on page load
$(document).ready(() => {
    getBadKeywords();
    getUsers();
    getConfigs() 
});

// Add bad keyword
$('#badKeywordForm').submit((event) => {
    event.preventDefault();
    const keyword = $('#keyword').val();
    $.post("/admin/badkeywords", { keyword }, (data) => {
        $('#keyword').val('');
        getBadKeywords();
    });
});

// Delete bad keyword
$('#badKeywordList').on('click', 'button.delete', function() {
    const id = $(this).attr('data-id');
    $.ajax({
        url: `/admin/badkeywords/${id}`,
        type: 'DELETE',
        success: () => {
            getBadKeywords();
        }
    });
});

// Lock user
$('#lockModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget) // Button that triggered the modal

    var recipient = button.data('whatever') // Extract info from data-* attributes
    const userId = button.data('id'); // Extract info from id attributes

    var modal = $(this)
    modal.find('.modal-body strong').text(recipient)
    //Xác nhận xóa người dùng
    $("#confirmLockButton").click(function() {
        // Gửi request lên server để xóa user
        // Sau khi xóa, cập nhật lại danh sách user bằng cách gọi lại hàm loadUsers()
        $.ajax({
            url: `/admin/user/${userId}/lock`,
            type: 'PUT',
            success: () => {
              getUsers();
              $(this).closest('.modal').modal('hide');
            }
        });
    });
})
// unLock user
$('#unlockModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget) // Button that triggered the modal

    var recipient = button.data('whatever') // Extract info from data-* attributes
    const userId = button.data('id'); // Extract info from id attributes

    var modal = $(this)
    modal.find('.modal-body strong').text(recipient)
    //Xác nhận xóa người dùng
    $("#confirmUnlockButton").click(function() {
        // Gửi request lên server để xóa user
        // Sau khi xóa, cập nhật lại danh sách user bằng cách gọi lại hàm loadUsers()
        $.ajax({
            url: `/admin/user/${userId}/unlock`,
            type: 'PUT',
            success: () => {
              getUsers();
              $(this).closest('.modal').modal('hide');
            }
        });
    });
})

// Delete user
$('#deleteModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget) // Button that triggered the modal

    var recipient = button.data('whatever') // Extract info from data-* attributes
    const userId = button.data('id'); // Extract info from id attributes

    var modal = $(this)
    modal.find('.modal-body strong').text(recipient)
    //Xác nhận xóa người dùng
    $("#confirmDeleteButton").click(function() {
        // Gửi request lên server để xóa user
        // Sau khi xóa, cập nhật lại danh sách user bằng cách gọi lại hàm loadUsers()
        $.ajax({
            url: `/admin/user/${userId}`,
            type: 'DELETE',
            success: () => {
              getUsers();
              $(this).closest('.modal').modal('hide');
            }
        });
    });
})

//Update configs
$('#email-limits-form').submit(function(event) {
    // Ngăn chặn hành động mặc định của form
    event.preventDefault();
  
    // Lấy dữ liệu từ form
    var formData = {
      maxRecipients: $('#max-recipients').val(),
      maxAttachmentSize: $('#max-attachment-size').val(),
      maxAttachments: $('#max-attachments').val(),
      maxEmailSize: $('#max-email-size').val()
    };
  
    // Gửi yêu cầu POST đến server
    $.ajax({
      type: 'POST',
      url: '/admin/configs',
      data: formData,
      success: function(response) {
        // Nếu thành công, reload lại trang
        location.reload();
      },
      error: function(jqXHR, textStatus, errorThrown) {
        // Xử lý lỗi
        console.error(textStatus, errorThrown);
      }
    });
});

//Logout account
$("#btnLogout").click(function() {
    $.ajax({
        type: 'POST',
        url: '/api/account/logout',
        success: function(response) {
          // Nếu thành công, reload lại trang
          location.reload();
        },
        error: function(jqXHR, textStatus, errorThrown) {
          // Xử lý lỗi
          console.error(textStatus, errorThrown);
        }
    });
})
// Get bad keywords
function getBadKeywords() {
    $.get(`/admin/badkeywords`, (data) => {
        const listItems = data.map(badKeyword => `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <span>${badKeyword.keyword}</span>
                <button class="btn btn-danger btn-sm delete" data-id="${badKeyword._id}">Delete</button>
            </li>`);
        const listItemsText = listItems.join('');

        $('#badKeywordList').empty().append(listItemsText);
    });
}
function getConfigs() {
    $.get('/admin/configs', function (config) {
        const { maxRecipients, maxAttachmentSize, maxAttachments, maxEmailSize } = config;
      
        $('#max-recipients').val(maxRecipients);
        $('#max-attachment-size').val(maxAttachmentSize / (1024 * 1024));
        $('#max-attachments').val(maxAttachments);
        $('#max-email-size').val(maxEmailSize / (1024 * 1024));
    });
    
}
// Get users
function getUsers() {
    $.get(`/admin/users`, (data) => {
        const userList = $('#userList');
        userList.empty();
        const rows = data.map((user, index) => `
            <tr onclick="showUserDetails('${user._id}')">
                <td>${index + 1}</td>
                <td>${user.firstname} ${user.lastname}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>
                <button class="btn btn-danger btn-sm btn-delete-modal" data-id="${user._id}" data-whatever="${user.firstname} ${user.lastname}" data-toggle="modal" data-target="#deleteModal">Delete</button>
                </td>
            </tr>
        `).join('');

        userList.append(rows);
    });
}
// Xem chi tiết thông tin của user đó
function showUserDetails(userId) {
    $.get(`/api/account/${userId}`, (data) => {
        const userDetails = $('#userDetails');
        userDetails.empty();
        const html = `
        <div class="container">
            <div class="row">
                <div class="col-md-3">
                <div class="text-center">
                    <img src="${data.avatar}" class="avatar img-circle" alt="avatar" style="width:100px; height: 100px">
                </div>
                </div>
                <div class="col-md-9 personal-info">
                    <div class="d-flex">
                        <strong>First name: </strong>
                        <p class="form-control-static">${data.firstname}</p>
                    </div>
                    <div class="d-flex">
                        <strong>Last name: </strong>
                        <p class="form-control-static">${data.lastname}</p>
                    </div>
                    <div class="d-flex">
                        <strong>Location: </strong>
                        <p class="form-control-static">${data.location ? data.location : "User does not have a digital address"}</p>
                    </div>
                    <div class="d-flex">
                        <strong>Email: </strong>
                        <p class="form-control-static">${data.email}</p>
                    </div>
                    <div class="d-flex">
                        <strong>Phone: </strong>
                        <p class="form-control-static">${data.phone ? data.phone : "User has not updated phone number"}</p>
                    </div>
                </div>
            </div>
        </div>
        `
        userDetails.append(html);
        $('#userDetailsModal').modal('show');
      });
}  
