interface UserDetailPageProps {
  params: { id: string };
  searchParams: { mode?: string };
}

export default function UserDetailPage({
  params,
  searchParams,
}: UserDetailPageProps) {
  const isEdit = searchParams.mode === "edit";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="text-lg font-semibold text-gray-900">User {params.id}</h1>
      <p className="mt-2 text-sm text-gray-500">
        {isEdit
          ? "Edit mode is not implemented yet."
          : "User details view is not implemented yet."}
      </p>
    </div>
  );
}
