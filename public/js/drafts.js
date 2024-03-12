// Load drafts on page load
$(document).ready(() => {
    getDrafts();
});
$(document).on('click', '.draft-item', function() {
    var id = $(this).attr('id');
    const userId = $('#userId').val();
    const receiver = $('#receiverDraftInput')
    const bcc = $('#bccDraftInput')

    const subject = $('#subjectDraftInput')
    const message = $('#messageDraftInput')
    const attachment = $('#attachmentDraftInput')

    $.post(`/api/account/drafts/${userId}/${id}`, (data) => {
        receiver.val(data[0].receiver);
        bcc.val(data[0].bcc);
        subject.val(data[0].subject);
        message.val(data[0].message);
        attachment.val(data[0].attachment);  
    });
    $("#btnUpdateDraft").click(function() {
        $.ajax({
			type: "PUT",
			url: `/api/account/drafts/${userId}/${id}`,
			data: {
				receiver: receiver.val(), 
				subject: subject.val(),
				message: message.val(),
                attachment: attachment.val(),
                bcc: bcc.val()
			},
			success: function(response) {
                getDrafts()
			},
			error: function(xhr, status, error) {
				console.error(error);
			}
		})
    })
    $("#btnDeleteDraft").click(function() {
        $.ajax({
			type: "DELETE",
			url: `/api/account/drafts/${userId}/${id}`,
			success: function(response) {
                // Remove the deleted draft item from the UI
                $(`#${draftId}`).remove();
                //Hide modal
                $("#myDraftModal").hide()
			},
			error: function(xhr, status, error) {
				console.error(error);
			}
		})
    })
})
$('#draft-form').submit(function(event) {
    // Ngăn chặn form gửi request mặc định
    event.preventDefault();
    const userId = $('#userId').val();
    const id = $(this).closest('.mail-item').attr('id')
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
          $('#myDraftModal').hide()
        },
        error: function(xhr, status, error) {
           // xử lý phản hồi lỗi
            $('#error-message').html(xhr.responseJSON); // hiển thị thông báo lỗi
            $('#errorModal').modal('show'); // hiển thị modal thông báo lỗi
        }
    });
});
// Get drafts
function getDrafts() {
    const userId = $('#userId').val();
    $.post(`/api/account/drafts/${userId}`, (data) => {
        if(data.length == 0) {
            const listItems = `
                <div class="loader_container">
                    <img src="/img/nomail.jpg" />
                    <h4 class="text-second my-3">No draft found associated with your account.</h4 class="text-second">
                </div>
            `
            $('#draftList').empty().append(listItems);
        } else {
            $("#draftsNumber").text(`${data.length} Drafts`)
            const listItems = data.map(draft => `
                <div id="${draft._id}" class="draft-item w-full px-3 py-2 mb-1 flex rounded-base border relative border-left" href="#myDraftModal" data-toggle="modal">
                    <div class="flex-1">
                        <div class="mr-2">
                            <h4 class="m-0 p-0 text-lg text-primary"> ${draft.subject}</h4>
                        </div>   
                        <div>
                            <p class="m-0 p-0 text-sm text-second">
                                ${draft.message}
                            </p>
                        </div>
                    </div>
                    <div class="draft-date text-second text-sm italic w-1-10">
                        ${draft.date}
                    </div>
                    <div class="draft-delete btnDeleteDraft">
                        <i class="fa fa-trash"></i>
                    </div>
                </div>
            `);
            const listItemsText = listItems.join('');
    
            $('#draftList').empty().append(listItemsText);
        }
        // Add event listener to the delete button
        $('.btnDeleteDraft').on('click', function(e) {
            e.stopPropagation();
            const draftId = $(this).closest('.draft-item').attr('id');
            $.ajax({
                url: `/api/account/drafts/${userId}/${draftId}`,
                type: 'DELETE',
                success: function(result) {
                    // Remove the deleted draft item from the UI
                    $(`#${draftId}`).remove();
                },
                error: function(error) {
                    console.log(error);
                }
            });
        });
    });
}

