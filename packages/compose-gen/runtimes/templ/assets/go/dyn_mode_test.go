package uiutils

import "testing"

func TestCnvClassModes(t *testing.T) {
	if ClassMode() != ClassesUtilities {
		t.Fatalf("default mode %q", ClassMode())
	}
	if got := Cnv("p-4 flex", nil, "", " p-2 "); got != "flex p-2" {
		t.Fatalf("utilities: %q", got)
	}
	SetClassMode(ClassesSemantic)
	defer SetClassMode(ClassesUtilities)
	if got := Cnv("p-4 flex", nil, "", " p-2 ", false); got != "p-4 flex p-2" {
		t.Fatalf("semantic: %q", got)
	}
}
