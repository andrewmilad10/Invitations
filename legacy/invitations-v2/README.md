# Luxury Wedding Invitation V2

Open `index.html` directly in Chrome/Edge.

Included:
- Reliable clickable envelope and wax-seal opening
- Luxury responsive design
- Exact countdown
- Dedicated Church card with Google Maps
- Dedicated Venue card with Google Maps
- 9-photo dynamic gallery with masonry-style layout and fullscreen lightbox
- Music player
- Wedding schedule
- RSVP form saved locally in browser
- Mobile responsive layout
- Easy `config.js` customization

## Add your music
Put your MP3 at:
assets/audio/wedding-song.mp3

## Add your photos
You can put local photos in assets/images and replace the URLs in config.js:
["assets/images/photo1.jpg","Photo 1",""]

## Change wedding details
Edit config.js:
- names
- weddingDate
- heroDate
- church name/address
- venue name/address
- gallery
- audio path

## RSVP
Demo RSVP data is stored in localStorage under `weddingRSVPs`.
For a real wedding website, connect the form to a database/API before publishing.

## Important
Replace all sample names, addresses, dates, and demo photographs before publishing.


### Updated envelope experience
- The envelope is now a fixed first-screen experience, so it cannot leave a blank colored 100vh section above the invitation.
- Tapping the seal opens the flap first, then transitions into the invitation hero.
- After the transition, the envelope screen is removed from document flow and the invitation starts at the top of the page.
- Added reduced-motion support for accessibility.


UPDATED — September 2026
- Envelope starts completely closed; card is fully masked until opening.
- Flap opens with 3D motion, then the card rises and scales into the matching website hero.
- Music button removed. Audio is configured to start at 0:00 at 48% volume.
- Browser autoplay policies can prevent sound before the first user gesture; tapping the envelope starts it immediately if that happens.
- Put the actual MP3 at assets/audio/wedding-song.mp3.
