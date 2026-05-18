import type { IInitialState } from './services/base/typing';

/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(initialState: any) {
	const currentUser = initialState?.currentUser;
	const role = currentUser?.role?.toLowerCase() || '';

	console.log('Access Plugin - Current User:', currentUser);
	console.log('Access Plugin - Detected Role:', role);

	return {
		canAdmin: role === 'admin',
		canStorekeeper: role === 'storekeeper',
		canBorrower: role === 'borrower',
		canAdminOrStorekeeper: ['admin', 'storekeeper'].includes(role),
		canAll: ['admin', 'storekeeper', 'borrower'].includes(role),
	};
}
