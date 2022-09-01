const image_input = document.querySelector("#image-input");

if(image_input) {
    image_input.addEventListener("change", function() {
        const reader = new FileReader();
        reader.addEventListener("load", () => {
          const uploaded_image = reader.result;
          document.querySelector("#canvas").style.backgroundImage = `url(${uploaded_image})`;
        });
        reader.readAsDataURL(this.files[0]);
      });
}
