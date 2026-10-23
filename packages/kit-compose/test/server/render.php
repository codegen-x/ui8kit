<?php

// Server parity harness (Twig, Latte): php render.php <twig|latte> <kit runtime src> <compose runtime src>
// stdin [{"template":"compose/Stack.html.twig","params":{...}}] -> stdout JSON list of HTML (children are trusted test markup).

declare(strict_types=1);

require __DIR__ . '/vendor/autoload.php';

[, $engine, $kit, $compose] = $argv;
foreach (glob($kit . '/runtime/*.php') as $f) require_once $f;
foreach (glob($compose . '/compose/*.php') as $f) require_once $f;

$cases = json_decode((string) stream_get_contents(STDIN), true, 512, JSON_THROW_ON_ERROR);
if ($engine === 'twig') {
    $twig = new \Twig\Environment(new \Twig\Loader\FilesystemLoader([$kit, $compose]), ['autoescape' => 'html', 'strict_variables' => false, 'cache' => false]);
    $twig->addExtension(new \UI8Kit\Twig\TwigExtension());
    $twig->addExtension(new \CodegenX\Compose\Twig\ComposeExtension());
    $render = static fn (string $t, array $p): string => $twig->render($t, $p);
} else {
    // Latte resolves '../ui/...' from compose/: one root with ui/ (the kit) and compose/ side by side
    $root = sys_get_temp_dir() . '/kit-compose-latte-' . md5($kit . $compose);
    @mkdir($root);
    foreach (['ui' => $kit . '/ui', 'compose' => $compose . '/compose'] as $l => $t) {
        if (!is_link("$root/$l")) symlink($t, "$root/$l");
    }
    $latte = new \Latte\Engine();
    $latte->setTempDirectory($root . '-cache');
    $latte->setLoader(new \Latte\Loaders\FileLoader($root));
    $render = static fn (string $t, array $p): string => $latte->renderToString($t, $p);
}
$out = [];
foreach ($cases as $c) $out[] = $render($c['template'], (array) ($c['params'] ?? []));
echo json_encode($out, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES);
