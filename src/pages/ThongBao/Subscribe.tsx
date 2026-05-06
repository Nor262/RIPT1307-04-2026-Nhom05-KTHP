import { initOneSignal } from '@/services/base/api';
import { unitName } from '@/services/base/constant';
import React, { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import OneSignal from 'react-onesignal';

const SubscribeOneSignal = () => {
	const accessToken = useAuthStore((state) => state.accessToken);

	useEffect(() => {
		document.title = `Đăng ký nhận thông báo | ${unitName.toUpperCase()}`;
	}, []);

	/**
	 * Init OneSignal playerId with auth User
	 */
	useEffect(() => {
		if (accessToken)
			OneSignal.getUserId().then((playerId) => {
				// Init playerId to Back-end and Close popup window
				if (playerId)
					initOneSignal({ playerId }).then(() => {
						window.opener = null;
						window.open('', '_self');
						window.close();
					});
			});
	}, [accessToken]);

	// TODO: Update UI
	return <div>SubscribeOneSignal</div>;
};

export default SubscribeOneSignal;
