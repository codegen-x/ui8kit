<?php

// Organism parity harness (Twig, Latte): php render-organisms.php <twig|latte> <kit runtime src> <kit-compose runtime src>
// stdin [{"template":"blocks/hero.html.twig","p":{...},"children"?:"a plain string"}] -> stdout JSON list of HTML (a failure is "ERROR: <message>").

declare(strict_types=1);

require __DIR__ . '/vendor/autoload.php';

[, $engine, $kit, $compose] = $argv;
$kit = (string) realpath($kit);
$compose = (string) realpath($compose);
foreach (glob($kit . '/runtime/*.php') as $f) require_once $f;
foreach (glob($compose . '/compose/*.php') as $f) require_once $f;
foreach (['CnMerge', 'Runtime', 'OrganismExtension'] as $f) require_once $compose . "/organisms/$f.php";

$cases = json_decode((string) stream_get_contents(STDIN), true, 512, JSON_THROW_ON_ERROR);
if ($engine === 'twig') {
    $twig = new \Twig\Environment(new \Twig\Loader\FilesystemLoader([$kit, $compose]), ['autoescape' => 'html', 'strict_variables' => false, 'cache' => false]);
    $twig->addExtension(new \UI8Kit\Twig\TwigExtension());
    $twig->addExtension(new \CodegenX\Compose\Twig\ComposeExtension());
    $twig->addExtension(new \CodegenX\Organisms\Twig\OrganismExtension($compose));
    $render = static fn (string $t, array $vars): string => $twig->render($t, $vars);
} else {
    // Latte resolves '../ui/...' from compose/: one root with ui/ (the kit) and compose/, blocks/, icons/ side by side
    $root = sys_get_temp_dir() . '/kit-compose-org-latte-' . md5($kit . $compose);
    @mkdir($root);
    foreach (['ui' => $kit . '/ui', 'compose' => $compose . '/compose', 'blocks' => $compose . '/blocks', 'icons' => $compose . '/icons'] as $l => $t) {
        if (!is_link("$root/$l")) symlink($t, "$root/$l");
    }
    $latte = new \Latte\Engine();
    $latte->setTempDirectory($root . '-cache');
    $latte->setLoader(new \Latte\Loaders\FileLoader($root));
    $latte->addExtension(new \CodegenX\Organisms\Latte\OrganismExtension($root, $latte));
    $render = static fn (string $t, array $vars): string => $latte->renderToString($t, $vars);
}
$out = [];
foreach ($cases as $c) {
    try {
        $out[] = $render($c['template'], ['p' => (array) ($c['p'] ?? [])] + (array_key_exists('children', $c) ? ['children' => $c['children']] : []));
    } catch (\Throwable $e) {
        $out[] = 'ERROR: ' . get_class($e) . ': ' . $e->getMessage();
    }
}
echo json_encode($out, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES);
