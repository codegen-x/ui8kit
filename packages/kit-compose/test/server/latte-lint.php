<?php

// Latte constant lint: php latte-lint.php <file.latte>... -> stdout JSON [{"file","message"}] of every notice, warning
// or deprecation the real Latte compiler raises (e.g. "Using unqualified constant 'ENT_QUOTES' is deprecated"),
// plus compile errors. Latte reports these only when it compiles, i.e. on a cold cache, and bare PHP (php -n) prints
// them to stdout, where they break the JSON of the parity harness: every generated template must compile silently.

declare(strict_types=1);

require __DIR__ . '/vendor/autoload.php';

$latte = new \Latte\Engine();
$latte->setLoader(new \Latte\Loaders\FileLoader('/'));
$out = [];
foreach (array_slice($argv, 1) as $file) {
    $path = (string) realpath($file);
    set_error_handler(static function (int $no, string $msg) use ($file, &$out): bool {
        $out[] = ['file' => $file, 'message' => $msg];
        return true;
    });
    try {
        $latte->compile($path);
    } catch (\Throwable $e) {
        $out[] = ['file' => $file, 'message' => 'compile error: ' . $e->getMessage()];
    } finally {
        restore_error_handler();
    }
}
echo json_encode($out, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES);
