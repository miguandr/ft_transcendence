// Role formatters
export function formatOrgRole(role: "admin" | "member"): "Admin" | "Member" {
	return role === "admin" ? "Admin" : "Member";
}

export function formatScrumRole(
	role: "scrum_master" | "product_owner" | "developer"):
		"Scrum Master" | "Product Owner" | "Developer"
{
	if (!role) return null;
	switch (role)
	{
		case "scrum_master": return "Scrum Master";
		case "product_owner": return "Product Owner";
		case "developer": return "Developer";
	}
}

// UI generators
export function generateAvatar(name: string): string
{
	const parts = name.split(" ");
	return parts.map(part => part[0]).join("").toUpperCase().slice(0, 2);
}

const colorPalette = [
	"from-emerald-200 to-green-300",
	"from-cyan-200 to-blue-300",
	"from-pink-200 to-rose-300",
	"from-amber-200 to-yellow-300",
	"from-purple-200 to-violet-300",
	"from-rose-200 to-pink-300"
];

export function assignColor(index: number): string {
	return colorPalette[index % colorPalette.length];
}
