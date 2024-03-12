(function ($) {
	/**
	 * Create drag and drop element.
	 */
	var customDragandDrop = function (element) {
		$(element).addClass("kwt-file__input");
		var element = $(element).wrap(
			`<div class="kwt-file"><div class="kwt-file__drop-area"><span class='kwt-file__choose-file ${
				element.attributes.data_btn_text
					? "" === element.attributes.data_btn_text.textContent
						? ""
						: "kwt-file_btn-text"
					: ""
			}'>${
				element.attributes.data_btn_text
					? "" === element.attributes.data_btn_text.textContent
						? `<i class="fas fa-cloud-upload-alt"></i>`
						: `${element.attributes.data_btn_text.textContent}`
					: `<i class="fas fa-cloud-upload-alt"></i>`
			}</span>${element.outerHTML}</span><span class="kwt-file__msg">${
				"" === element.placeholder ? "or drop files here" : `${element.placeholder}`
			}</span><div class="kwt-file__delete"></div></div></div>`
		);
		var element = element.parents(".kwt-file");

		// Add class on focus and drage enter event.
		element.on("dragenter focus click", ".kwt-file__input", function (e) {
			$(this).parents(".kwt-file__drop-area").addClass("is-active");
		});

		// Remove class on blur and drage leave event.
		element.on("dragleave blur drop", ".kwt-file__input", function (e) {
			$(this).parents(".kwt-file__drop-area").removeClass("is-active");
		});

		// Show filename when change file.
		element.on("change", ".kwt-file__input", function (e) {
			let filesCount = $(this)[0].files.length;
			let textContainer = $(this).next(".kwt-file__msg");
			if (1 === filesCount) {
				let fileName = $(this).val().split("\\").pop();
				textContainer
					.text(fileName)
					.next(".kwt-file__delete")
					.css("display", "block");
			} else if (filesCount > 1) {
				textContainer
					.text(filesCount + " files selected")
					.next(".kwt-file__delete")
					.css("display", "inline-block");
			} else {
				textContainer.text(
					`${
						"" === this[0].placeholder
							? "or drop files here"
							: `${this[0].placeholder}`
					}`
				);
				$(this)
					.parents(".kwt-file")
					.find(".kwt-file__delete")
					.css("display", "none");
			}
		});

		// Delete selected file.
		element.on("click", ".kwt-file__delete", function (e) {
			let deleteElement = $(this);
			deleteElement.parents(".kwt-file").find(`.kwt-file__input`).val(null);
			deleteElement
				.css("display", "none")
				.prev(`.kwt-file__msg`)
				.text(
					`${
						"" ===
						$(this).parents(".kwt-file").find(".kwt-file__input")[0].placeholder
							? "or drop files here"
							: `${
									$(this).parents(".kwt-file").find(".kwt-file__input")[0].placeholder
							  }`
					}`
				);
		});
	};

	$.fn.kwtFileUpload = function (e) {
		var _this = $(this);
		$.each(_this, function (index, element) {
			customDragandDrop(element);
		});
		return this;
	};
})(jQuery);

// Plugin initialize
jQuery(document).ready(function ($) {
	$(".demo1").kwtFileUpload();
});
