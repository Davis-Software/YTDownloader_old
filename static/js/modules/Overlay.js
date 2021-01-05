var _basicmodal_body = `
                        <div class="modal fade" id="{{id}}">
                            <div class="modal-dialog" id="config_{{id}}">
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <h4 class="modal-title">{{heading}}</h4>
                                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                                    </div>
                                    <div class="modal-body" id="body_{{id}}"></div>
                                    <div class="modal-footer" id="footer_{{id}}">
                                        <button type="button" class="btn btn-danger" data-dismiss="modal" id="cbtn_{{id}}">Close</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        `;

var _errormodal_body = `
                        <div class="modal fade" id="{{id}}">
                            <div class="modal-dialog modal-xxl" id="config_{{id}}">
                                <div class="modal-content">
                                    <div class="modal-header bg-danger">
                                        <h4 class="modal-title">Error</h4>
                                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                                    </div>
                                    <div class="modal-body bg-warning" id="body_{{id}}"></div>
                                    <div class="modal-footer bg-danger" id="footer_{{id}}">
                                        <button type="button" class="btn btn-secondary" data-dismiss="modal">OK</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        `;

class Overlay{
    constructor(wrapper, id, heading, size="normal"){
        this.id = id;
        document.getElementById(wrapper).innerHTML = _basicmodal_body.replace("{{heading}}", heading).replace("{{id}}", id).replace("{{id}}", id).replace("{{id}}", id).replace("{{id}}", id).replace("{{id}}", id)
        this.wrapper = document.getElementById(id);
        this.wrapper_config = document.getElementById(`config_${id}`);
        this.wrapper_body = document.getElementById(`body_${id}`);
        this.wrapper_footer = document.getElementById(`footer_${id}`);
        switch(size){
            case "small": this.wrapper_config.classList.add("modal-sm"); break;
            case "normal": break;
            case "large": this.wrapper_config.classList.add("modal-lg"); break;
            case "extralarge": this.wrapper_config.classList.add("modal-xl"); break;
            default: this.wrapper_config.classList.add(size); break;
        }
    }
    Button(id, text, classes=""){
        this.wrapper_footer.innerHTML += `<button id="${id}" class="btn ${classes}">${text}</button>`;
        return document.getElementById(id);
    }
    Input(id, type, text, classes="", value=""){
        this.wrapper_body.innerHTML += `<input id="${id}" class="form-control ${classes}" type="${type}" placeholder="${text}" value="${value}">`;
        return document.getElementById(id);
    }
    TextArea(id, text, classes="", value=""){
        this.wrapper_body.innerHTML += `<textarea id="${id}" class="form-control ${classes}" placeholder="${text}" value="${value}"></textarea>`;
        return document.getElementById(id);
    }
    FileInput(id, multiple, classes="", value=""){
        if(multiple){
            this.wrapper_body.innerHTML += `<input id="${id}" class="${classes}" type="file" value="${value}" multiple>`;
        }else{
            this.wrapper_body.innerHTML += `<input id="${id}" class="${classes}" type="file" value="${value}">`;
        }
        return document.getElementById(id);
    }
    Text(text, tag="span", classes=""){
        this.wrapper_body.innerHTML += `<${tag} class="${classes}">${text}</${tag}>`;
    }
    CustomText(id, tag, text, classes=""){
        this.wrapper_body.innerHTML += `<${tag} id="${id}" class="${classes}">${text}</${tag}>`;
        return document.getElementById(id);
    }
    Custom(customhtml){
        this.wrapper_body.innerHTML += customhtml;
    }
    Linebreak(){
        this.wrapper_body.innerHTML += "<br>";
    }

    disableBTN(bool){
        document.getElementById(`cbtn_${this.id}`).disabled = bool
    }
    modal(hideorshow){
        switch (hideorshow){
            case "show": $(`#${this.id}`).modal("show"); break;
            case "hide": $(`#${this.id}`).modal("hide"); break;
            default: $(`#${this.id}`).modal("show"); break;
        }
    }
}

class OverlayError{
    constructor(wrapper, id, error){
        this.id = id;
        document.getElementById(wrapper).innerHTML = _errormodal_body.replace("{{id}}", id).replace("{{id}}", id).replace("{{id}}", id).replace("{{id}}", id)
        this.wrapper = document.getElementById(id);
        this.wrapper_config = document.getElementById(`config_${id}`);
        this.wrapper_body = document.getElementById(`body_${id}`);
        this.wrapper_footer = document.getElementById(`footer_${id}`);
        this.wrapper_body.innerHTML = error
    }
    modal(hideorshow){
        switch (hideorshow){
            case "show": $(`#${this.id}`).modal("show"); break;
            case "hide": $(`#${this.id}`).modal("hide"); break;
            default: $(`#${this.id}`).modal("show"); break;
        }
    }
}