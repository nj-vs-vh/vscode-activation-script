# `activation-script` VSCode extension


Execute arbitrary scripts and/or commands on terminal startup.

### Usage

```bash
mkdir .vscode
cd .vscode
touch activation.json
```

Edit contents of `activation.json` to something like

```json
{
  "scripts": [
    {
      "path": "/path/to/my/sourcable/script.sh"
    }
  ],
  "commands": [
    "export FOO=bar",
    "echo I AM NOW ACTIVATED"
  ]
}
```

Or you may use `Add activation script` command from Command Pallette
