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

        const createSession = (tenantId) => {
            fetch('https://api.nosupport.in/api/session' + `?tenantId=${tenantId}`)
                .then(response => response.json())
                .then(data => {
                    const sessionId = data?.id;
                    session = sessionId;
                    setCookie('nosupport', JSON.stringify({ tenantId, sessionId }), 5);
                    createIframe(tenantId, session);
                })
                .catch(error => console.error('Error fetching session ID:', error));
        }

        // If the session ID cookie is not present, set the default value
        if (!nosupport || nosupport.tenantId !== window?.chatConfig?.tenantId) {

            const { tenantId } = window?.chatConfig;

            createSession(tenantId);
        }
        else {
            tenant = nosupport?.tenantId;
            session = nosupport?.sessionId;
            fetch('https://api.nosupport.in/api/session' + `/${session}`)
                .then(response => response.json())
                .then(data => {
                    if (data?.sessionHelpNeed === 'RESOLVED') {
                        createSession(tenant);
                    }
                    else {
                        createIframe(tenant, session);
                    }
                })
                .catch(error => console.error('Error fetching session ID:', error));
        }


        function sendMessageToIframe() {
            console.log('ifram message sent')
            const iframe = document.getElementById('iframeButton');
            const overlayDiv = document.getElementById('overlayDiv')
            // const btn = document.getElementById('nosupport-chatbot-button');
            if (iframe && overlayDiv) {
                console.log('ifram message true')
                iframe.contentWindow.postMessage('ButtonClicked', '*');
            }
        }

        var iframe;
        function createIframe(tenant, session) {
            iframe = document.createElement('iframe');
            iframe.src = `https://bot.nosupport.in?tenantId=${tenant}&sessionId=${session}`;
            iframe.style.cssText = "position: fixed; z-index: 9999; border:0px; bottom: 32px; right: 32px; width: 65px; height: 65px;transition: all 100ms";
            iframe.title = "Chatbot";
            iframe.id = 'iframeButton';
            document.body.appendChild(iframe);

            const overlayDiv = document.createElement('div');
            overlayDiv.style.cssText = "position: fixed; z-index: 10000; bottom: 32px; right: 32px; width: 65px; height: 65px;transition: all 100ms;cursor: pointer";
            overlayDiv.addEventListener('click', sendMessageToIframe);
            overlayDiv.id = 'overlayDiv'
            document.body.appendChild(overlayDiv);

            iframe.addEventListener('load', () => {
                overlayDiv.style.width = `${iframe.clientWidth}px`;
                overlayDiv.style.height = `${iframe.clientHeight}px`;
            });
        }


        window.addEventListener('message', (event) => {
            const message = event.data;

            if (message === 'sendchatbot') {

                const iframe = document.getElementById('iframeButton');
                const overlayDiv = document.getElementById('overlayDiv')

                if (iframe && overlayDiv) {
                    if (window.innerWidth >= 400) {
                        iframe.style.minWidth = '65px';
                        iframe.style.maxWidth = '65px';
                        iframe.style.minHeight = '65px';
                    }
                    iframe.style.width = '65px';
                    iframe.style.height = '65px';
                    iframe.style.top = 'auto';
                    iframe.style.left = 'auto';
                    iframe.style.right = '32px';
                    iframe.style.bottom = '32px';
                    iframe.style.transitionDuration = '100ms';
                    overlayDiv.style.transitionDuration = '100ms';
                    overlayDiv.style.zIndex = '10000';
                    console.log('in overlay close')
                }
            }
            else if (message === 'chatBotOpen') {
                console.log(message + 'message from chatbot')
                const iframe = document.getElementById('iframeButton');
                const overlayDiv = document.getElementById('overlayDiv');
                if (iframe && overlayDiv) {
                    if (window.innerWidth >= 400) {
                        iframe.style.width = '52vh';
                        iframe.style.minWidth = '400px';
                        iframe.style.maxWidth = '90vw';
                        iframe.style.height = '85vh';
                        iframe.style.minHeight = '600px';
                    }
                    else {
                        iframe.style.width = '100%';
                        iframe.style.height = '100%';
                        iframe.style.top = '0px';
                        iframe.style.bottom = '0px';
                        iframe.style.right = '0px';
                        iframe.style.left = '0px';

                    }
                    iframe.style.transitionDuration = '100ms';
                    overlayDiv.style.zIndex = '-10';
                    overlayDiv.style.transitionDuration = '100ms';
                }
            }
        });

    })();
}