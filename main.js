(() => {
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

    // If the session ID cookie is not present, set the default value
    if (!nosupport || nosupport.tenantId !== window?.chatConfig?.tenantId) {
        console.log('setting')
        const { tenantId } = window?.chatConfig;
        tenant = tenantId;
        fetch('http://api.nosupport.in/api/session' + `?tenantId=${tenantId}`) // Replace 'YOUR_API_ENDPOINT' with the actual API endpoint
            .then(response => response.json())
            .then(data => {
                const sessionId = data?.id;
                session = sessionId;
                setCookie('nosupport', JSON.stringify({ tenantId, sessionId }));
            })
            .catch(error => console.error('Error fetching session ID:', error));
        // setCookie('nosupport', window.chatConfig);
    }
    else {
        console.log('getting')
        tenant = nosupport?.tenantId;
        session = nosupport?.sessionId;
    }

    // Set the chatBotConfig using the retrieved or default session ID

    // Dynamically create an iframe
    var iframe = document.createElement('iframe');
    iframe.src = `https://chatit-eta.vercel.app?tenantId=${tenant}&sessionId=${session}`;
    iframe.style.cssText = "position: fixed; z-index: 10; top: 0px; left: 0px; width: 100vw; height: 100vh;";
    iframe.title = "Chatbot";

    document.body.appendChild(iframe);
})();