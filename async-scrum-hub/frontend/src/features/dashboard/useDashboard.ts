import { useState, useEffect } from "react";
import { getDashboardData } from "../../services/api";
import type { DashboardData } from "../../services/api";
import { useAuth } from "../../routes/useAuth";

export function useDashboard() {
	const { user } = useAuth();
	const [data, setData] = useState<DashboardData | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [errors, setErrors] = useState<string | null>(null);

	useEffect(() => {
		if (!user?.organization_id) return;

		const fetchData = async () => {
			setIsLoading(true);

			try {
				const result = await getDashboardData(user.organization_id!);
				setData(result);

			} catch (error: unknown) {
				const msg = (error as { error?: { message?: string } })?.error?.message;
				setErrors(msg ?? "Failed to load dashboard");
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [user?.organization_id]);

	return {
		user,
		data,
		isLoading,
		errors };
}
