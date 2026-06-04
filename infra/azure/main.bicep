// Function App Linux · Node 20 · plan Consumption (Y1) — capa gratuita de Azure Functions.
// Despliegue: scripts/azure/provision.ps1 (requiere `az login`).

targetScope = 'resourceGroup'

@description('Nombre global único de la Function App (solo letras/números/guiones).')
param functionAppName string = 'func-insoft-lablanggraph'

@description('Región (ej. eastus, eastus2).')
param location string = resourceGroup().location

@minLength(3)
@maxLength(24)
param storageAccountName string = 'stlab${take(uniqueString(resourceGroup().id), 16)}'

@description('Nombre global único del recurso Azure SignalR (modo serverless).')
param signalRName string = 'sigr-insoft-lablanggraph'

@description('Hub SignalR usado por negotiate/notify y el front.')
param signalRHubName string = 'lab'

@description('Orígenes CORS del servicio SignalR (front ISA-DOC, local, etc.).')
param signalRCorsOrigins array = [
  '*'
]

var hostingPlanName = 'plan-${functionAppName}'
var storageEndpoints = environment().suffixes.storage

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    allowBlobPublicAccess: false
  }
}

resource signalR 'Microsoft.SignalRService/signalR@2023-02-01' = {
  name: signalRName
  location: location
  sku: {
    name: 'Free_F1'
    tier: 'Free'
    capacity: 1
  }
  kind: 'SignalR'
  properties: {
    features: [
      {
        flag: 'ServiceMode'
        value: 'Serverless'
      }
    ]
    cors: {
      allowedOrigins: signalRCorsOrigins
    }
    tls: {
      clientCertEnabled: false
    }
  }
}

resource hostingPlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: hostingPlanName
  location: location
  sku: {
    name: 'Y1'
    tier: 'Dynamic'
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

resource functionApp 'Microsoft.Web/sites@2023-01-01' = {
  name: functionAppName
  location: location
  kind: 'functionapp,linux'
  properties: {
    serverFarmId: hostingPlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|20'
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      cors: {
        allowedOrigins: ['*']
        supportCredentials: false
      }
      appSettings: [
        {
          name: 'AzureWebJobsStorage'
          value: storageConnectionString()
        }
        {
          name: 'WEBSITE_CONTENTAZUREFILECONNECTIONSTRING'
          value: storageConnectionString()
        }
        {
          name: 'WEBSITE_CONTENTSHARE'
          value: toLower(functionAppName)
        }
        {
          name: 'FUNCTIONS_EXTENSION_VERSION'
          value: '~4'
        }
        {
          name: 'FUNCTIONS_WORKER_RUNTIME'
          value: 'node'
        }
        {
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: '~20'
        }
        {
          name: 'WEBSITE_RUN_FROM_PACKAGE'
          value: '1'
        }
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'false'
        }
        {
          name: 'ENABLE_ORYX_BUILD'
          value: 'false'
        }
        {
          name: 'AzureSignalRConnectionString'
          value: signalR.listKeys().primaryConnectionString
        }
        {
          name: 'SIGNALR_HUB_NAME'
          value: signalRHubName
        }
      ]
    }
  }
  dependsOn: [
    signalR
  ]
}

func storageConnectionString(): string {
  return 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};EndpointSuffix=${storageEndpoints};AccountKey=${storageAccount.listKeys().keys[0].value}'
}

output functionAppName string = functionApp.name
output functionAppDefaultHostName string = functionApp.properties.defaultHostName
output functionAppUrl string = 'https://${functionApp.properties.defaultHostName}'
output apiHealthUrl string = 'https://${functionApp.properties.defaultHostName}/api/health'
output storageAccountName string = storageAccount.name
output hostingPlanSku string = hostingPlan.sku.name
output signalRName string = signalR.name
output signalRHostName string = signalR.properties.hostName
output signalRSku string = signalR.sku.name
output signalRNegotiateUrl string = 'https://${functionApp.properties.defaultHostName}/api/signalr/negotiate'
