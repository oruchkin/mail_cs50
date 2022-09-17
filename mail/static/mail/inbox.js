document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  load_mailbox('inbox');  

  document.querySelector("#form_submit").addEventListener('click',() => {    
    send_mail();
    load_mailbox('sent');  
  });
});


function send_mail() {
  const recipients = document.querySelector('#compose-recipients').value.toLowerCase();
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({ recipients: recipients, subject: subject, body: body })
  })

  .then(response => response.json())
  .then(result => {
      console.log(result);    
     console.log(`Recipients, subj, body: ${result}`);  
  })
    
  .catch(error => {console.log('Error:', error);});  
}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-info').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  localStorage.clear();
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-info').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {    
      console.log(emails);      
      emails.forEach(email => open_mail(email,mailbox));    
  });
  
}


function open_mail(email,mailbox) {    
    const email_info = document.createElement('div');
    
    // using grid from bootstrap https://getbootstrap.com/docs/4.0/layout/grid/ class="row" and style_for_rows="col-sm"
    email_info.className = "row";   
    const style_for_rows = "col-sm"


    //recipient
    const recipient = document.createElement('div');  
    recipient.className = style_for_rows;  

    if (mailbox === "inbox") {
      recipient.innerHTML = email.sender;
    } 
    else {
      recipient.innerHTML = email.recipients;
    }
    email_info.append(recipient);
    
    //subject
    const subject = document.createElement('div');    
    subject.className = style_for_rows;
    subject.innerHTML = email.subject;
    email_info.append(subject);

    //timestamp
    const timestamp = document.createElement('div');      
    timestamp.className = style_for_rows;
    timestamp.innerHTML = email.timestamp;
    email_info.append(timestamp);

    
    //styling each row and appending info in it
    const each_row = document.createElement('div');    
    if (email.read === true) {
      each_row.className = "row-outline";           
    } 
    else {
      each_row.className = "row-outline read";  
    }

    each_row.append(email_info);    
    document.querySelector('#emails-view').append(each_row);
    each_row.addEventListener('click', () => view_email(email.id, mailbox));
}


function view_email(email_id, mailbox) {  

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-info').style.display = 'block';

  //making email.read = true
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: body = JSON.stringify({      
      read: true
    })
  })

  //creating detailed email in #email-info
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {   
      console.log(email);
      document.querySelector('#email-info-from').innerHTML = `<b>From:</b> ${email.sender}`;
      document.querySelector('#email-info-to').innerHTML = `<b>to:</b> ${email.recipients[0]}`;
      document.querySelector('#email-info-subject').innerHTML = `<b>subject:</b> ${email.subject}`;
      document.querySelector('#email-info-timestamp').innerHTML = `<b>timestamp:</b> ${email.timestamp}`;
      document.querySelector('#email-info-body').innerHTML = `${email.body}`;          

      //turn on/off reply/archive buttons
      if (mailbox == "inbox") {        
        console.log(mailbox)
        document.querySelector('#email-info-reply').style.display = 'block';
        document.querySelector('#email-info-archive').style.display = 'block'; 
        document.querySelector('#email-info-unarchive').style.display = 'none'; 
      } else if (mailbox == "sent") {        
        console.log(mailbox)
        document.querySelector('#email-info-reply').style.display = 'none';
        document.querySelector('#email-info-archive').style.display = 'none'; 
        document.querySelector('#email-info-unarchive').style.display = 'none'; 
      } else if (mailbox == "archive") {
        console.log(mailbox)
        document.querySelector('#email-info-reply').style.display = 'none';
        document.querySelector('#email-info-archive').style.display = 'none'; 
        document.querySelector('#email-info-unarchive').style.display = 'block'; 

      }
  });  
    
    document.querySelector("#email-info-archive").addEventListener('click', () => archive_func(email_id));
    document.querySelector("#email-info-unarchive").addEventListener('click', () => unarchive_func(email_id));
    document.querySelector("#email-info-reply").addEventListener('click', () => reply_func(email_id));
}

// archive email
function archive_func(email_id) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: body = JSON.stringify({       
      archived: true
    })
  })  
  document.location.href="/";
}

// UN-archive email
function unarchive_func(email_id) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: body = JSON.stringify({      
      archived: false
    })
  })  
  document.location.href="/";
}

function reply_func(email_id) {
  
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-info').style.display = 'none';

  console.log(email_id)

  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {    
      console.log(email);  

      // Pre-fill composition fields
      document.querySelector('#compose-recipients').value = `${email.sender}`;
      document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
      document.querySelector('#compose-body').value = ` On: ${email.timestamp} ${email.sender} wrote: "${email.body}" `;
      
       
  });

}
