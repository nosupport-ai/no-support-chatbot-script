window.onload = function () {
    (function () {

        console.log('window load');

        function setCookie(name, value, days) {
            console.log('cookie setting')
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            const expires = `expires=${date.toUTCString()}`;
            document.cookie = `${name}=${value}; ${expires}; path=/`;
            console.log('cookie setted')
        }

        // Function to get the value of a cookie
        function getCookie(name) {
            console.log('cookie getting')
            const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
            console.log('cookie returning')
            return match ? match[2] : null;
        }

        // Check if the session ID cookie is present
        const nosupport = JSON.parse(getCookie('nosupport'));

        let tenant = '', session = '';

        // If the session ID cookie is not present, set the default value
        if (!nosupport || nosupport.tenantId !== window?.chatConfig?.tenantId) {

            const { tenantId } = window?.chatConfig;
            tenant = tenantId;

            console.log('cookie fetching')
            fetch('https://api.nosupport.in/api/session' + `?tenantId=${tenantId}`) // Replace 'YOUR_API_ENDPOINT' with the actual API endpoint
                .then(response => response.json())
                .then(data => {
                    const sessionId = data?.id;
                    session = sessionId;
                    setCookie('nosupport', JSON.stringify({ tenantId, sessionId }), 5);
                    console.log('cookie fetched')
                })
                .catch(error => console.error('Error fetching session ID:', error));
        }
        else {
            console.log('else running')
            tenant = nosupport?.tenantId;
            session = nosupport?.sessionId;
            console.log('else runned')
        }

        const handleClick = () => {
            console.log('button cliec')
            sendMessageToIframe('ButtonClicked')
        }


        // Dynamically create an iframe
        var btns = document.createElement('button');
        btns.style.cssText = "position: fixed; z-index: 9998; bottom:40px; right: 40px; width: 70px; height: 70px; border-radius: 50%; background: transparent; border: 0px; outline: none; cursor: pointer;";
        btns.id = 'nosupport-chatbot-button';
        btns.onclick = handleClick;
        document.body.appendChild(btns);


        var iframe = document.createElement('iframe');
        iframe.src = `https://localhost:3000?tenantId=${tenant}&sessionId=${session}`;
        iframe.style.cssText = "position: fixed; z-index: 9999; bottom: 0; right: 0; width: 100vw; height: 100dvh; pointer-events: none;";
        iframe.title = "Chatbot";
        iframe.id = 'iframeButton';
        document.body.appendChild(iframe);

        function sendMessageToIframe(message) {
            const iframe = document.getElementById('iframeButton');
            const btn = document.getElementById('nosupport-chatbot-button');
            console.log('sending to ifram')
            if (iframe) {
                iframe.style.pointerEvents = 'auto';
                btn.style.pointerEvents = 'none';
                btn.style.zIndex = '-10';
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
        });

    })();
}