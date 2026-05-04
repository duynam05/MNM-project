<?php

namespace App\Http\Controllers\Api;

use App\Models\Permission;
use App\Models\Role;
use App\Support\ApiData;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function index()
    {
        $roles = Role::query()->with('permissions')->orderBy('name')->get();

        return $this->ok($roles->map(fn (Role $role) => ApiData::role($role))->values()->all());
    }

    public function store(Request $request)
    {
        $payload = $request->validate([
            'name' => ['required', 'string'],
            'description' => ['nullable', 'string'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        $role = Role::query()->updateOrCreate(
            ['name' => strtoupper(trim($payload['name']))],
            ['description' => $payload['description'] ?? null]
        );

        $permissions = Permission::query()
            ->whereIn('name', $payload['permissions'] ?? [])
            ->pluck('name')
            ->all();

        $role->permissions()->sync($permissions);
        $role->load('permissions');

        return $this->ok(ApiData::role($role));
    }

    public function destroy(Role $role)
    {
        $role->delete();

        return $this->ok(null);
    }
}
