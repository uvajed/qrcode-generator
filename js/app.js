/**
 * QR Code Generator - Main Application
 */

const App = {
    currentType: 'url',
    qrInstance: null,
    debounceTimer: null,

    init() {
        this.setupTypeSelector();
        this.setupCustomization();
        this.setupExport();
        this.setupFormListeners();
        this.showPlaceholder();
    },

    setupTypeSelector() {
        const buttons = document.querySelectorAll('.tab-btn');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.switchType(btn.dataset.type);
            });
        });
    },

    switchType(type) {
        this.currentType = type;

        document.querySelectorAll('.form-section').forEach(form => {
            form.classList.add('hidden');
        });

        const form = document.getElementById(`form-${type}`);
        if (form) {
            form.classList.remove('hidden');
        }

        this.showPlaceholder();
    },

    showPlaceholder() {
        const qrCode = document.getElementById('qrCode');
        qrCode.innerHTML = `
            <div class="text-center py-8">
                <div class="w-16 h-16 mx-auto mb-3 rounded-xl bg-gray-200 flex items-center justify-center">
                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
                    </svg>
                </div>
                <p class="text-gray-400 text-sm">Enter content above</p>
            </div>
        `;
    },

    setupFormListeners() {
        const inputs = document.querySelectorAll('#contentForm input, #contentForm textarea, #contentForm select');

        inputs.forEach(input => {
            const eventType = input.type === 'checkbox' ? 'change' : 'input';
            input.addEventListener(eventType, () => this.debouncedGenerate());

            if (input.tagName === 'SELECT') {
                input.addEventListener('change', () => this.debouncedGenerate());
            }
        });
    },

    debouncedGenerate() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => this.generateQR(), 250);
    },

    generateQR() {
        const encoder = QRTypes[this.currentType];
        if (!encoder) return;

        const content = encoder.encode();
        if (!content) {
            this.showPlaceholder();
            return;
        }

        const qrCode = document.getElementById('qrCode');
        const fgColor = document.getElementById('fgColor').value;
        const bgColor = document.getElementById('bgColor').value;
        const size = parseInt(document.getElementById('qrSize').value);
        const errorLevel = document.getElementById('errorCorrection').value;

        const errorLevelMap = {
            'L': QRCode.CorrectLevel.L,
            'M': QRCode.CorrectLevel.M,
            'Q': QRCode.CorrectLevel.Q,
            'H': QRCode.CorrectLevel.H
        };

        qrCode.innerHTML = '';

        try {
            this.qrInstance = new QRCode(qrCode, {
                text: content,
                width: size,
                height: size,
                colorDark: fgColor,
                colorLight: bgColor,
                correctLevel: errorLevelMap[errorLevel] || QRCode.CorrectLevel.M
            });
        } catch (error) {
            console.error('QR Generation error:', error);
            this.showPlaceholder();
        }
    },

    setupCustomization() {
        ['fgColor', 'bgColor', 'qrSize', 'errorCorrection'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => this.generateQR());
        });
    },

    setupExport() {
        document.getElementById('downloadPng').addEventListener('click', () => this.exportPNG());
        document.getElementById('downloadSvg').addEventListener('click', () => this.exportSVG());
        document.getElementById('copyClipboard').addEventListener('click', () => this.copyToClipboard());
    },

    async exportPNG() {
        const preview = document.getElementById('qrPreview');
        const canvas = preview.querySelector('canvas');

        if (!canvas) {
            this.showToast('Generate a QR code first');
            return;
        }

        try {
            const exportCanvas = await html2canvas(preview, { backgroundColor: null, scale: 2 });
            const link = document.createElement('a');
            link.download = 'qrcode.png';
            link.href = exportCanvas.toDataURL('image/png');
            link.click();
            this.showToast('Downloaded!');
        } catch (error) {
            const link = document.createElement('a');
            link.download = 'qrcode.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            this.showToast('Downloaded!');
        }
    },

    exportSVG() {
        const canvas = document.querySelector('#qrPreview canvas');

        if (!canvas) {
            this.showToast('Generate a QR code first');
            return;
        }

        const size = canvas.width;
        const dataUrl = canvas.toDataURL('image/png');
        const svgString = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <image width="${size}" height="${size}" xlink:href="${dataUrl}"/>
</svg>`;

        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const link = document.createElement('a');
        link.download = 'qrcode.svg';
        link.href = URL.createObjectURL(blob);
        link.click();
        this.showToast('Downloaded!');
    },

    async copyToClipboard() {
        const canvas = document.querySelector('#qrPreview canvas');

        if (!canvas) {
            this.showToast('Generate a QR code first');
            return;
        }

        try {
            const exportCanvas = await html2canvas(document.getElementById('qrPreview'), { backgroundColor: '#ffffff', scale: 2 });
            exportCanvas.toBlob(async (blob) => {
                try {
                    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                    this.showToast('Copied!');
                } catch (err) {
                    this.showToast('Failed to copy');
                }
            });
        } catch (error) {
            this.showToast('Failed to copy');
        }
    },

    showToast(message) {
        const toast = document.getElementById('toast');
        document.getElementById('toastMessage').textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();

    // Dark mode toggle
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    const sunIcon = themeToggle.querySelector('.sun-icon');
    const moonIcon = themeToggle.querySelector('.moon-icon');

    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        html.classList.add('dark');
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    }

    themeToggle.addEventListener('click', () => {
        html.classList.toggle('dark');
        const isDark = html.classList.contains('dark');

        sunIcon.classList.toggle('hidden', isDark);
        moonIcon.classList.toggle('hidden', !isDark);

        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
});
