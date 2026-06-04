# Infra Azure (Bicep)

| Archivo | Uso |
| --- | --- |
| `main.bicep` | Storage + plan **Y1** + Function App Node 20 + **SignalR Free_F1** (serverless) |
| `parameters.example.json` | Nombres personalizados (app + storage únicos globalmente) |

```powershell
az group create -n rg-insoft-lab-langgraph -l eastus2
az deployment group create -g rg-insoft-lab-langgraph -f main.bicep -p functionAppName=func-insoft-lablanggraph
```

O desde la raíz: `.\scripts\azure\provision.ps1`
