window.onload = function () {
    (function () {

        console.log('window load');

        function setCookie(name, value, days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            const expires = `expires=${date.toUTCString()}`;
            document.cookie = `${name}=${value}; ${expires}; path=/`;
        }

        // Function to get the value of a cookie
        function getCookie(name) {
            const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
            return match ? match[2] : null;
        }

        // Check if the session ID cookie is present
        const nosupport = JSON.parse(getCookie('nosupport'));

        let tenant = '', session = '';


        const handleClick = () => {
            sendMessageToIframe('ButtonClicked')
        }

        // If the session ID cookie is not present, set the default value
        if (!nosupport || nosupport.tenantId !== window?.chatConfig?.tenantId) {

            const { tenantId } = window?.chatConfig;
            tenant = tenantId;

            fetch('https://api.nosupport.in/api/session' + `?tenantId=${tenantId}`)
                .then(response => response.json())
                .then(data => {
                    const sessionId = data?.id;
                    session = sessionId;
                    setCookie('nosupport', JSON.stringify({ tenantId, sessionId }), 5);
                    createIframe(tenant, session);
                })
                .catch(error => console.error('Error fetching session ID:', error));
        }
        else {
            tenant = nosupport?.tenantId;
            session = nosupport?.sessionId;
            createIframe(tenant, session);
        }


        var btns;

        function createButton() {
            btns = document.createElement('button');
            btns.style.cssText = "position: fixed; z-index: 9998; bottom:40px; right: 40px; width: 70px; height: 70px; border-radius: 50%; background: transparent; border: 0px; outline: none; cursor: pointer;";
            btns.id = 'nosupport-chatbot-button';
            btns.onclick = handleClick;
            document.body.appendChild(btns);
        }

        var iframe;
        function createIframe(tenant, session) {
            iframe = document.createElement('iframe');
            iframe.src = `https://bot.nosupport.in?tenantId=${tenant}&sessionId=${session}`;
            iframe.style.cssText = "position: fixed; z-index: 9999; bottom: 0; right: 0; width: 100vw; height: 100dvh; pointer-events: none;";
            iframe.title = "Chatbot";
            iframe.id = 'iframeButton';
            document.body.appendChild(iframe);

            createButton();
        }

        function sendMessageToIframe(message) {
            const iframe = document.getElementById('iframeButton');
            const btn = document.getElementById('nosupport-chatbot-button');
            if (iframe) {

                iframe.contentWindow.postMessage(message, '*');
                console.log('sent')
            }
        }

        window.addEventListener('message', (event) => {
            const message = event.data;

            if (message === 'sendchatbot') {

                const iframe = document.getElementById('iframeButton');
                const btn = document.getElementById('nosupport-chatbot-button');

                if (iframe) {
                    iframe.style.pointerEvents = 'none';
                }
                if (btn) {
                    btn.style.pointerEvents = 'auto';
                    btn.style.zIndex = '9998';
                }
            }
            else if (message === 'chatBotOpen') {
                const iframe = document.getElementById('iframeButton');
                const btn = document.getElementById('nosupport-chatbot-button');
                if (iframe && btn) {
                    iframe.style.pointerEvents = 'auto';
                    btn.style.pointerEvents = 'none';
                    btn.style.zIndex = '-10';
                }
            }
        });

    })();
}