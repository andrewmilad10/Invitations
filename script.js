(() => {
const $=s=>document.querySelector(s), c=WEDDING_CONFIG;
$("#churchName").textContent=c.locations.church.name;
$("#churchAddress").textContent=c.locations.church.address;
$("#venueName").textContent=c.locations.venue.name;
$("#venueAddress").textContent=c.locations.venue.address;
$("#churchMap").href="https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(c.locations.church.address);
$("#venueMap").href="https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(c.locations.venue.address);
const first=c.couple.firstName.trim();
const second=c.couple.secondName.trim();
const coupleText=`${first} & ${second}`;
const initials=`${first.charAt(0).toUpperCase()} <b>&</b> ${second.charAt(0).toUpperCase()}`;
document.title=`${coupleText} | Wedding Invitation`;
document.querySelector(".hero h1 span:first-child").textContent=first;
document.querySelector(".hero h1 span:last-child").textContent=second;
document.querySelector("#heroDate").textContent=c.heroDate;
document.querySelector("#envelopeNames").innerHTML=`${first} <i>&</i> ${second}`;
document.querySelector("#envelopeDate").textContent=c.heroDate.split(" · ")[0].replace(/ /g," · ");
document.querySelector("#coupleLogo").innerHTML=initials;
document.querySelectorAll(".names").forEach(x=>x.innerHTML=`${first} <span>&</span> ${second}`);
document.querySelector("#closingNames").innerHTML=`${first} <span>&</span> ${second}`;
document.querySelector("#closingDate").textContent=c.heroDate.split(" · ")[0].replace(/ /g," · ");
document.querySelector("#siteFooter").textContent=`Made with love · ${coupleText}`;

// Keep all displayed date/location labels driven by config as well.
const dateObj=new Date(c.weddingDate);
const weekday=new Intl.DateTimeFormat("en-US",{weekday:"long"}).format(dateObj);
const dateLong=new Intl.DateTimeFormat("en-US",{day:"numeric",month:"long",year:"numeric"}).format(dateObj);
const churchTime="5:00 PM", venueTime="7:30 PM";
document.querySelector("#churchDateTime").textContent=`${churchTime} · ${weekday}, ${dateLong}`;
document.querySelector("#venueDateTime").textContent=`${venueTime} · ${weekday}, ${dateLong}`;
document.querySelector("#churchTime").textContent=churchTime;
document.querySelector("#venueTime").textContent=venueTime;
document.querySelector("#churchScheduleName").textContent=c.locations.church.name;
document.querySelector("#venueScheduleName").textContent=c.locations.venue.name;

window.addEventListener("load",()=>setTimeout(()=>$("#loader").classList.add("hide"),350));
document.body.classList.add("envelope-active");

const screen=$("#envelopeScreen"), inv=$("#invitation"), env=$("#openInvitation");
let opened=false;
const audio=$("#audio");
audio.src=c.audio;
audio.preload="auto";
audio.volume=0.48;

async function startMusic(){
  audio.currentTime=0;
  audio.volume=0.48;
  try { await audio.play(); } catch(e) { /* Browsers may block autoplay until the first gesture. */ }
}

// Try immediately. The envelope tap below is also a user gesture, so music can start there if autoplay is blocked.
startMusic();

function openEnvelope(e){
  if(e)e.preventDefault();
  if(opened)return;
  opened=true;
  startMusic();
  env.classList.add("opening");

  // Let the flap/card movement be visible before the outer cover starts to dissolve.
  setTimeout(()=>screen.classList.add("opened"),1050);

  // The invitation rises into the exact same hero artwork, making the transition read as one continuous card.
  setTimeout(()=>{
    screen.classList.add("gone");
    inv.classList.remove("hidden");
    requestAnimationFrame(()=>requestAnimationFrame(()=>inv.classList.add("revealed")));
    document.body.classList.remove("envelope-active");
    window.scrollTo({top:0,left:0,behavior:"instant"});
  },1750);
}
env.addEventListener("click",openEnvelope,{passive:false});

const target=new Date(c.weddingDate).getTime();
function countdown(){
 let d=target-Date.now(); if(d<0)d=0;
 $("#days").textContent=String(Math.floor(d/86400000)).padStart(2,"0");
 $("#hours").textContent=String(Math.floor(d/3600000)%24).padStart(2,"0");
 $("#minutes").textContent=String(Math.floor(d/60000)%60).padStart(2,"0");
 $("#seconds").textContent=String(Math.floor(d/1000)%60).padStart(2,"0");
}
countdown();setInterval(countdown,1000);

const gallery=$("#galleryGrid");
c.gallery.forEach((p,i)=>{
 const b=document.createElement("button"); b.className="photo "+p[2]; b.innerHTML=`<img loading="lazy" src="${p[0]}" alt="${p[1]}"><span>${String(i+1).padStart(2,"0")}</span>`;
 b.onclick=()=>{const l=document.createElement("div");l.className="lightbox";l.innerHTML=`<button>×</button><img src="${p[0]}" alt="${p[1]}">`;document.body.appendChild(l);requestAnimationFrame(()=>l.classList.add("show"));l.onclick=e=>{if(e.target===l||e.target.tagName==="BUTTON")l.remove()}};gallery.appendChild(b);
});

$("#rsvpForm").addEventListener("submit",e=>{
 e.preventDefault();const d=Object.fromEntries(new FormData(e.target));const a=JSON.parse(localStorage.getItem("weddingRSVPs")||"[]");a.push({...d,date:new Date().toISOString()});localStorage.setItem("weddingRSVPs",JSON.stringify(a));$("#formMessage").textContent="Thank you! Your RSVP has been saved on this device.";e.target.reset();
});
const io=new IntersectionObserver(es=>es.forEach(x=>x.isIntersecting&&x.target.classList.add("visible")),{threshold:.12});
document.querySelectorAll(".section,.timeline>div,.location-card,.photo").forEach(x=>io.observe(x));
})();