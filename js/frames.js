/**
 * Frame Manager
 */

const FrameManager = {
    currentFrame: 'none',

    applyFrame(frameType) {
        this.currentFrame = frameType;
        this.rebuildFrame();
    },

    rebuildFrame() {
        const container = document.getElementById('qrPreview');
        const qrCodeEl = document.getElementById('qrCode');

        if (!qrCodeEl) return;

        // Remove existing frame wrapper
        const existingWrapper = container.querySelector('.frame-wrapper');
        if (existingWrapper) {
            container.appendChild(qrCodeEl);
            existingWrapper.remove();
        }

        // Reset container class
        container.className = 'qr-wrapper';

        if (this.currentFrame === 'none') {
            return;
        }

        // Create frame
        const wrapper = document.createElement('div');
        wrapper.className = 'frame-wrapper';
        wrapper.innerHTML = this.getFrameHTML(this.currentFrame);

        container.appendChild(wrapper);

        const contentArea = wrapper.querySelector('.qr-inner') || wrapper.firstElementChild;
        if (contentArea) {
            contentArea.appendChild(qrCodeEl);
        }
    },

    getFrameHTML(frameType) {
        const frames = {
            rounded: `<div class="frame-rounded"><div class="qr-inner"></div></div>`,
            shadow: `<div class="frame-shadow"><div class="qr-inner"></div></div>`,
            border: `<div class="frame-border"><div class="qr-inner"></div></div>`,
            polaroid: `<div class="frame-polaroid"><div class="qr-inner"></div></div>`,
            stamp: `<div class="frame-stamp"><div class="qr-inner"></div></div>`,
            circle: `<div class="frame-circle"><div class="qr-inner"></div></div>`,
            neon: `<div class="frame-neon"><div class="qr-inner"></div></div>`,
            present: `<div class="frame-present"><div class="qr-inner"></div></div>`,
            heart: `<div class="frame-heart"><div class="qr-inner"></div></div>`,
            badge: `<div class="frame-badge"><div class="qr-inner"></div></div>`,
            ribbon: `<div class="frame-ribbon"><div class="qr-inner"></div></div>`
        };
        return frames[frameType] || '';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.frame-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.frame-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            FrameManager.applyFrame(btn.dataset.frame);
        });
    });
});
