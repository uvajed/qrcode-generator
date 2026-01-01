/**
 * QR Content Type Encoders
 * Handles encoding for all supported QR code content types
 */

const QRTypes = {
    /**
     * URL - Plain URL
     */
    url: {
        encode: () => {
            const url = document.getElementById('input-url').value.trim();
            if (!url) return null;
            // Add https:// if no protocol specified
            if (url && !url.match(/^https?:\/\//i)) {
                return 'https://' + url;
            }
            return url;
        },
        validate: () => {
            const url = document.getElementById('input-url').value.trim();
            return url.length > 0;
        }
    },

    /**
     * vCard - Contact information
     */
    vcard: {
        encode: () => {
            const name = document.getElementById('vcard-name').value.trim();
            const phone = document.getElementById('vcard-phone').value.trim();
            const email = document.getElementById('vcard-email').value.trim();
            const company = document.getElementById('vcard-company').value.trim();
            const title = document.getElementById('vcard-title').value.trim();
            const website = document.getElementById('vcard-website').value.trim();
            const address = document.getElementById('vcard-address').value.trim();

            if (!name) return null;

            const nameParts = name.split(' ');
            const lastName = nameParts.length > 1 ? nameParts.pop() : '';
            const firstName = nameParts.join(' ');

            let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';
            vcard += `N:${lastName};${firstName};;;\n`;
            vcard += `FN:${name}\n`;

            if (phone) vcard += `TEL:${phone}\n`;
            if (email) vcard += `EMAIL:${email}\n`;
            if (company) vcard += `ORG:${company}\n`;
            if (title) vcard += `TITLE:${title}\n`;
            if (website) vcard += `URL:${website}\n`;
            if (address) vcard += `ADR:;;${address.replace(/\n/g, ', ')};;;;\n`;

            vcard += 'END:VCARD';
            return vcard;
        },
        validate: () => {
            return document.getElementById('vcard-name').value.trim().length > 0;
        }
    },

    /**
     * Text - Plain text
     */
    text: {
        encode: () => {
            return document.getElementById('input-text').value.trim() || null;
        },
        validate: () => {
            return document.getElementById('input-text').value.trim().length > 0;
        }
    },

    /**
     * Email - mailto: link
     */
    email: {
        encode: () => {
            const to = document.getElementById('email-to').value.trim();
            const subject = document.getElementById('email-subject').value.trim();
            const body = document.getElementById('email-body').value.trim();

            if (!to) return null;

            let mailto = `mailto:${to}`;
            const params = [];

            if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
            if (body) params.push(`body=${encodeURIComponent(body)}`);

            if (params.length > 0) {
                mailto += '?' + params.join('&');
            }

            return mailto;
        },
        validate: () => {
            const email = document.getElementById('email-to').value.trim();
            return email.length > 0 && email.includes('@');
        }
    },

    /**
     * SMS - sms: link
     */
    sms: {
        encode: () => {
            const phone = document.getElementById('sms-phone').value.trim();
            const message = document.getElementById('sms-message').value.trim();

            if (!phone) return null;

            let sms = `sms:${phone}`;
            if (message) {
                sms += `?body=${encodeURIComponent(message)}`;
            }

            return sms;
        },
        validate: () => {
            return document.getElementById('sms-phone').value.trim().length > 0;
        }
    },

    /**
     * WiFi - WIFI: format
     */
    wifi: {
        encode: () => {
            const ssid = document.getElementById('wifi-ssid').value.trim();
            const password = document.getElementById('wifi-password').value.trim();
            const encryption = document.getElementById('wifi-encryption').value;
            const hidden = document.getElementById('wifi-hidden').checked;

            if (!ssid) return null;

            // Escape special characters in SSID and password
            const escapeWifi = (str) => {
                return str.replace(/[\\;,:\"]/g, '\\$&');
            };

            let wifi = `WIFI:T:${encryption};S:${escapeWifi(ssid)};`;

            if (encryption !== 'nopass' && password) {
                wifi += `P:${escapeWifi(password)};`;
            }

            if (hidden) {
                wifi += 'H:true;';
            }

            wifi += ';';
            return wifi;
        },
        validate: () => {
            return document.getElementById('wifi-ssid').value.trim().length > 0;
        }
    },

    /**
     * Twitter - Profile or Tweet intent
     */
    twitter: {
        encode: () => {
            const type = document.getElementById('twitter-type').value;

            if (type === 'profile') {
                const username = document.getElementById('twitter-username').value.trim().replace('@', '');
                if (!username) return null;
                return `https://twitter.com/${username}`;
            } else {
                const text = document.getElementById('twitter-text').value.trim();
                if (!text) return null;
                return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
            }
        },
        validate: () => {
            const type = document.getElementById('twitter-type').value;
            if (type === 'profile') {
                return document.getElementById('twitter-username').value.trim().length > 0;
            }
            return document.getElementById('twitter-text').value.trim().length > 0;
        }
    },

    /**
     * Facebook - Profile or Share
     */
    facebook: {
        encode: () => {
            const type = document.getElementById('facebook-type').value;

            if (type === 'profile') {
                const profile = document.getElementById('facebook-profile').value.trim();
                if (!profile) return null;

                // Check if it's already a full URL
                if (profile.startsWith('http')) {
                    return profile;
                }
                return `https://facebook.com/${profile}`;
            } else {
                const shareUrl = document.getElementById('facebook-share-url').value.trim();
                if (!shareUrl) return null;
                return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
            }
        },
        validate: () => {
            const type = document.getElementById('facebook-type').value;
            if (type === 'profile') {
                return document.getElementById('facebook-profile').value.trim().length > 0;
            }
            return document.getElementById('facebook-share-url').value.trim().length > 0;
        }
    },

    /**
     * PDF - URL to PDF file
     */
    pdf: {
        encode: () => {
            const url = document.getElementById('pdf-url').value.trim();
            if (!url) return null;
            if (!url.match(/^https?:\/\//i)) {
                return 'https://' + url;
            }
            return url;
        },
        validate: () => {
            return document.getElementById('pdf-url').value.trim().length > 0;
        }
    },

    /**
     * MP3 - URL to audio file
     */
    mp3: {
        encode: () => {
            const url = document.getElementById('mp3-url').value.trim();
            if (!url) return null;
            if (!url.match(/^https?:\/\//i)) {
                return 'https://' + url;
            }
            return url;
        },
        validate: () => {
            return document.getElementById('mp3-url').value.trim().length > 0;
        }
    },

    /**
     * App Store - iOS or Android app link
     */
    appstore: {
        encode: () => {
            const ios = document.getElementById('appstore-ios').value.trim();
            const android = document.getElementById('appstore-android').value.trim();

            // Prefer iOS if both provided
            if (ios) return ios;
            if (android) return android;
            return null;
        },
        validate: () => {
            return document.getElementById('appstore-ios').value.trim().length > 0 ||
                   document.getElementById('appstore-android').value.trim().length > 0;
        }
    },

    /**
     * Image - URL to image
     */
    image: {
        encode: () => {
            const url = document.getElementById('image-url').value.trim();
            if (!url) return null;
            if (!url.match(/^https?:\/\//i)) {
                return 'https://' + url;
            }
            return url;
        },
        validate: () => {
            return document.getElementById('image-url').value.trim().length > 0;
        }
    }
};

// Initialize Twitter/Facebook type toggles
document.addEventListener('DOMContentLoaded', () => {
    // Twitter type toggle
    const twitterType = document.getElementById('twitter-type');
    if (twitterType) {
        twitterType.addEventListener('change', (e) => {
            const profileFields = document.getElementById('twitter-profile-fields');
            const tweetFields = document.getElementById('twitter-tweet-fields');

            if (e.target.value === 'profile') {
                profileFields.classList.remove('hidden');
                tweetFields.classList.add('hidden');
            } else {
                profileFields.classList.add('hidden');
                tweetFields.classList.remove('hidden');
            }
        });
    }

    // Facebook type toggle
    const facebookType = document.getElementById('facebook-type');
    if (facebookType) {
        facebookType.addEventListener('change', (e) => {
            const profileFields = document.getElementById('facebook-profile-fields');
            const shareFields = document.getElementById('facebook-share-fields');

            if (e.target.value === 'profile') {
                profileFields.classList.remove('hidden');
                shareFields.classList.add('hidden');
            } else {
                profileFields.classList.add('hidden');
                shareFields.classList.remove('hidden');
            }
        });
    }
});
