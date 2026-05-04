<?php

namespace App\Http\Controllers\Api;

use App\Models\Permission;
use App\Support\ApiData;
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    public function index()
    {
        $permissions = Permission::query()->orderBy('name')->get();

        return $this->ok($permissions->map(fn (Permission $permission) => ApiData::permission($permission))->values()->all());
    }

    public function store(Request $request)
    {
        $payload = $request->validate([
            'name' => ['required', 'string'],
            'description' => ['nullable', 'string'],
        ]);

        $permission = Permission::query()->updateOrCreate(
            ['name' => strtoupper(trim($payload['name']))],
            ['description' => $payload['description'] ?? null]
        );

        return $this->ok(ApiData::permission($permission));
    }

    public function destroy(Permission $permission)
    {
        $permission->delete();

        return $this->ok(null);
    }
}
