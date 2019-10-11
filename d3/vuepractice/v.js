// Vue.component('button-counter', {
//     template: '<button v-on:click = "displayLanguage(item)"><span style = "font-size:25px;">{{ item }}</span></button>',
//     data: function () {
//        return {
//           counter: 0
//        }
//     },
//     props:['item'],
//     methods: {
//        displayLanguage: function (lng) {
//           console.log(lng);
//           this.$emit('showlanguage', lng);
//        }
//     },
//  });
 var vm = new Vue({
    el: '#databinding',
    data: {
       items: [],
       val: "",
       styleObj: {
        width: "30%",
        padding: "12px 20px",
        margin: "8px 0",
        boxSizing: "border-box"
       }
    },
    methods: {
       showInputValue: function(event) {
           console.log("Value -----", event.target.value);
           this.items.push(event.target.value);
           this.val = "";
           
       }
    }
 })