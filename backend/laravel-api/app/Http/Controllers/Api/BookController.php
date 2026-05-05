<?php

namespace App\Http\Controllers\Api;

use App\Models\Book;
use App\Support\CloudinaryService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class BookController extends Controller
{
    public function __construct(private readonly CloudinaryService $cloudinaryService)
    {
    }

    public function index(Request $request)
    {
        $query = Book::query();

        if ($request->filled('q')) {
            $keyword = trim((string) $request->query('q'));
            $query->where(function ($builder) use ($keyword) {
                $builder
                    ->where('title', 'like', '%'.$keyword.'%')
                    ->orWhere('author', 'like', '%'.$keyword.'%');
            });
        }

        match (strtolower((string) $request->query('sort', 'popular'))) {
            'price_asc' => $query->orderBy('price')->orderBy('title'),
            'price_desc' => $query->orderByDesc('price')->orderBy('title'),
            'title_asc' => $query->orderBy('title'),
            'title_desc' => $query->orderByDesc('title'),
            'rating' => $query->orderByDesc('rating')->orderBy('title'),
            default => $query->orderByDesc('rating')->orderBy('title'),
        };

        $size = min(max((int) $request->query('size', 12), 1), 100);
        $page = max((int) $request->query('page', 0), 0);
        $category = trim((string) $request->query('category', ''));

        if ($category !== '') {
            $books = $query
                ->get()
                ->filter(fn (Book $book) => $this->bookHasCategory($book, $category))
                ->values();

            $paginator = $this->paginateCollection($books, $size, $page);
        } else {
            $paginator = $query->paginate($size, ['*'], 'page', $page + 1);
        }

        return $this->ok([
            'content' => $paginator->items(),
            'page' => $paginator->currentPage() - 1,
            'size' => $paginator->perPage(),
            'totalElements' => $paginator->total(),
            'totalPages' => $paginator->lastPage(),
        ]);
    }

    public function show(Book $book)
    {
        return $this->ok($book);
    }

    public function store(Request $request)
    {
        $payload = $this->validateBook($request);

        return $this->ok(Book::query()->create($payload));
    }

    public function update(Request $request, Book $book)
    {
        $book->update($this->validateBook($request));

        return $this->ok($book->fresh());
    }

    public function destroy(Book $book)
    {
        $book->delete();

        return $this->ok(null);
    }

    public function uploadImage(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'image', 'max:5120'],
        ]);

        $uploaded = $this->cloudinaryService->uploadImage($request->file('file'), 'books');
        if ($uploaded && filled($uploaded['url'] ?? null)) {
            return $this->ok([
                'url' => $uploaded['url'],
                'publicId' => $uploaded['publicId'] ?? null,
                'assetId' => $uploaded['assetId'] ?? null,
            ]);
        }

        if (! $request->file('file')->isValid()) {
            abort(400, 'Invalid image upload');
        }

        $path = $request->file('file')->storeAs(
            'books',
            Str::uuid()->toString().'.'.$request->file('file')->getClientOriginalExtension(),
            'public'
        );

        return $this->ok([
            'url' => rtrim((string) config('app.url'), '/').'/storage/'.$path,
        ]);
    }

    private function validateBook(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string'],
            'author' => ['required', 'string'],
            'category' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'rating' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'stock' => ['required', 'integer', 'min:0'],
            'image' => ['nullable', 'string'],
        ]);
    }

    private function bookHasCategory(Book $book, string $category): bool
    {
        $needle = Str::lower(trim($category));

        return collect($this->splitCategories($book->category))
            ->map(fn (string $item) => Str::lower($item))
            ->contains($needle);
    }

    private function splitCategories(?string $value): array
    {
        return collect(preg_split('/\s*(?:,|;|\||\/|\s-\s)\s*/u', (string) $value) ?: [])
            ->map(fn (string $item) => trim($item))
            ->filter()
            ->unique(fn (string $item) => Str::lower($item))
            ->values()
            ->all();
    }

    private function paginateCollection(Collection $items, int $size, int $page): LengthAwarePaginator
    {
        $currentPage = $page + 1;
        $total = $items->count();
        $results = $items->slice($page * $size, $size)->values();

        return new LengthAwarePaginator(
            $results,
            $total,
            $size,
            $currentPage,
        );
    }
}
