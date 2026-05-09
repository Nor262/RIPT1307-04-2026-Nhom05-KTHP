import { initOneSignal } from '@/services/base/api';
import { AppModules } from '@/services/base/constant';
import { currentRole, oneSignalClient, oneSignalRole } from '@/utils/ip';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import OneSignal from 'react-onesignal';

const OneSignalBounder = (props: { children: React.ReactNode }) => {
	const [oneSignalId, setOneSignalId] = useState<string | null | undefined>();
	const accessToken = useAuthStore((state) => state.accessToken);
	const iframeSource = AppModules[oneSignalRole].url;
	// let iframe: HTMLIFrameElement | null = null;

	const getUserIdOnesignal = async () => {
		if (!!oneSignalClient) {
			await OneSignal.init({
				appId: oneSignalClient,
			});
			const id = await (OneSignal as any).getUserId();
			setOneSignalId(id);
		}
	};

	/** Show Popup center screen */
	const showPopup = (url: string, w: number = 600, h: number = 400) => {
		const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
		const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;

		const width = window.innerWidth
			? window.innerWidth
			: document.documentElement.clientWidth
			? document.documentElement.clientWidth
			: screen.width;
		const height = window.innerHeight
			? window.innerHeight
			: document.documentElement.clientHeight
			? document.documentElement.clientHeight
			: screen.height;

		const systemZoom = width / window.screen.availWidth;
		const left = (width - w) / 2 / systemZoom + (window.screenLeft !== undefined ? window.screenLeft : window.screenX);
		const top = (height - h) / 2 / systemZoom + dualScreenTop;
		window.open(
			url,
			'_blank',
			`scrollbars=yes,
						width=${w / systemZoom}, 
						height=${h / systemZoom}, 
						top=${top}, 
						left=${left}
						`,
		);
	};

	useEffect(() => {
		// Nếu đây là trang handle OneSignal
		if (oneSignalRole.valueOf() === currentRole.valueOf()) getUserIdOnesignal();
		else if (iframeSource) {
			// window.addEventListener('message', receiveMessage, false);
			// showPopup(`${iframeSource}notification/subscribe`, 1, 1);
			// iframe = document.createElement('iframe');
			// iframe.setAttribute('src', `${iframeSource}notification/check?source=${window.location.origin}`);
			// iframe.style.display = 'none';
			// document.body.appendChild(iframe);
		}
	}, []);

	/**
	 * Init OneSignal playerId with auth User
	 */
	useEffect(() => {
		if (accessToken) {
			(OneSignal as any).getUserId().then((playerId: string) => {
				// Init playerId to Back-end and Close popup window
				if (playerId)
					initOneSignal({ playerId }).then(() => {
						window.opener = null;
						window.open('', '_self');
						window.close();
					});
			});
		}
	}, [oneSignalId, accessToken]);

	return <>{props.children}</>;
};

export default OneSignalBounder;
