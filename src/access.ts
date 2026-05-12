import type { IInitialState } from './services/base/typing';

/**
 * Role-Based Access Control (RBAC)
 * 3 roles: admin, storekeeper, borrower
 *
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 */
export default function access(initialState: IInitialState) {
	const role = initialState.currentUser?.role;

	return {
		// ===== Role checks =====
		isAdmin: role === 'admin',
		isStorekeeper: role === 'storekeeper',
		isBorrower: role === 'borrower',

		// ===== Composite checks for route access =====
		/** Admin + Storekeeper can access */
		adminOrStorekeeper: role === 'admin' || role === 'storekeeper',

		/** Admin only */
		adminOnly: role === 'admin',

		/** Everyone who is logged in */
		authenticated: !!role,
	};
}
