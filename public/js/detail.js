$(function() {
    // Bắt sự kiện khi chọn file
    $('#avatar').on('change', function(event) {
      // Đọc file và hiển thị trên trang web
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = function(e) {
        $('#avatar-preview').attr('src', e.target.result);
        $('#saveBtn').addClass('flex')
        $('#saveBtn').removeClass('none')

      };
      reader.readAsDataURL(file);
    });
  
    // Bắt sự kiện khi save update avatar
    $('#changeAvatarForm').on('submit', function(event) {
        event.preventDefault();
        const userId = $('#userId').val();
        // Lấy dữ liệu form và gửi lên server
        const formData = new FormData(this);
        $.ajax({
            url: `/api/account/update-avatar/${userId}`,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(data) {
                $('#saveBtn').addClass('none')
            },
            error: function(error) {
                console.error(error);
            }
        });
    });
    
});
  