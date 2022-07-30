const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);
const database=admin.database();
const date = require("date-and-time");
const { user } = require("firebase-functions/v1/auth");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
   functions.logger.info("Hello logs!", {structuredData: true});
   response.send("Hello from Firebase!");
 });


exports.newNodeDetected = functions.database.ref("trigger")
 .onWrite((snapshot) => {
   
    const ref=database.ref("data");
    ref.once("value",(data_snap)=>{
        data_snap.forEach((pushkey)=>{
            //comparing district and station name.
            const nextdate=pushkey.child("L").val();
            const del_on=pushkey.child("delete_on").val();
            const j_col=pushkey.child("J").val();
            const now=new Date();
            const value = date.format(now, "DD.MM.YYYY");
            database.ref("vdate").set(value+"");
            var current = new Date(now.getFullYear(), now.getMonth()+1, now.getDate());
            const value1 = date.format(current, "DD.MM.YYYY");
            if ( value==nextdate ) {
                database.ref("vdel").set(value1+"");
                const C=pushkey.child("C").val();
                const B=pushkey.child("B").val();
                const D=pushkey.child("D").val();
                const E=pushkey.child("E").val();
                const I=pushkey.child("I").val();
                const G=pushkey.child("G").val();
                const K=pushkey.child("K").val();
                const H=pushkey.child("H").val();
                const type=pushkey.child("type").val();
                
                send_to_phone_numbers_ref(value1,C,B,D,E,I,G,K,H,type);
            }
            if(del_on===null){
                if(j_col!="None"){
                    database.ref("data").child(pushkey.key).child("delete_on").set(value1);
                }
            }
            else{
                if ( value==del_on ) {
                    database.ref("vdeeee").set("deleted ="+del_on);
                    database.ref("data").child(pushkey).remove();
                }
            }
        });
    });
   
});

function send_to_phone_numbers_ref(value1,C,B,D,E,I,G,K,H,type){

    const phn_no_ref=database.ref("Phone numbers");
    phn_no_ref.once("value",(district_ref)=>{
        district_ref.forEach((dist)=>{
            if(dist.key.trim()===C.trim()){
                //database.ref("value").set(dist.key.toLowerCase()+" = "+C.toLowerCase());
                const dist_ref=database.ref("Phone numbers/"+dist.key);
                dist_ref.once("value",(station_ref)=>{
                    station_ref.forEach((stat)=>{
                        const stat_key=stat.key.trim();
                        //database.ref("vstat_key").set(stat_key.toLowerCase()+"");
                        const station_B="PS "+B.trim();
                        if(stat_key===station_B){
                            const phone_number=stat.val();
                            //database.ref("vphone").set(phone_number);
                            const users_ref=database.ref("users");
                            users_ref.once("value", (each_user) =>{
                                each_user.forEach((user_key)=>{
                                    const user_number=user_key.child("phone").val().substr(3);
                                    //database.ref("vaa1"+user_key.key).set(user_number);
                                    if(phone_number===user_number){
                                      const key_users_ref=database.ref("users/"+user_key.key+"/token");
                                      key_users_ref.once("value",(eachtoken) =>{
                                        eachtoken.forEach((tokens)=>{
                                            const token=tokens.val();

                                            //database.ref("v_n_k").set(token);
                                            if(type==="MCRC _RM_ RETURN"){
                                              const title = "High Court Alert";
                                              const content = "हाईकोर्ट अलर्ट:-डायरी वापसी"+"\nदिनाँक:- "+value1+" \n"
                                                            +"\n"+C+"\n"+D+" No. "+E+"/"+G+"\n"
                                                            +"Crime No. "+H+"/"+I+"\n"
                                                            +"Police station: "+B+"\n"
                                                            +"1)उपरोक्त मूल केश डायरी  महाधिवक्ता कार्यालय द्वारा दी गयी मूल पावती लाने पर ही दी जाएगी।\n"
                                                            +"2) उपरोक्त मूल केश डायरी "+K+" से पांच दिवस के भीतर बेल शाखा, कार्यालय महाधिवक्ता,उच्च न्यायालय से वापिस ले जावें।";
                            
                                                try{
                                                    const message = {
                                                    notification: {
                                                        title: title,
                                                        body: content,
                                                    },
                                                        token: token,
                                                    };
                                                    const response =  admin.messaging().send(message);
                                                    console.log(response);
                                                }
                                                catch(Exception){
                                                    console.log("error fcm")                                        
                                                }
                                          }
                                          else{
                                              const title = "High Court Alert";
                                              const content = "हाईकोर्ट अलर्ट:-डायरी माँग"+"\nदिनाँक:- "+value1+" \n"
                                                          +"\n"+C+"\n"+D+" No. "+E+"/"+G+"\n"
                                                          +"Crime No. "+H+"/"+I+"\n"
                                                          +"Police station: "+B+"\n"
                                                          +"उपरोक्त मूल केश डायरी दिनाँक "+K+" तक बेल शाखा, कार्यालय महाधिवक्ता,उच्च न्यायालय छतीसगढ़ में  अनिवार्यतः जमा करें।";
                          
                                              try{
                                                  const message = {
                                                  notification: {
                                                      title: title,
                                                      body: content,
                                                  },
                                                      token: token,
                                                  };
                                                  const response =  admin.messaging().send(message);
                                                  console.log(response);
                                              }
                                              catch(Exception){
                                                  console.log("error fcm")                                        
                                              }
                                          }
                                        });
                                      });
                                    }
                                });
                            });
                        }
                    });
                });
            }
        });
    });

}








