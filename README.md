# PowerShell Module Autocomplete

An example using PowerShell modules of Autocomplete using Elastic Search

![](https://i.imgur.com/uSmV1HD.png)

This was thrown together pretty quickly for a demo.

This assumes Elastic Search is running on port 9200.

The mapping:

``` json
{
    "mappings": {
        "packages" : {
            "properties" : {
                "suggest-name" : {
                    "type" : "completion"
                },
                "suggest-tags" : {
                    "type" : "completion"
                },
                "suggest-cmdlets" : {
                    "type" : "completion"
                },
                "description" : {
                    "type" : "text"
                }
            }
        }
    }
}
'
```

To index all the data:

``` powershell

Find-Module | foreach {
    $cmdlets = New-Object System.Collections.ArrayList($null)

    if($_.AdditionalMetadata.Cmdlets) {
        $cmdlets.AddRange($_.AdditionalMetadata.Cmdlets.Split(" "))
    }

    if($_.AdditionalMetadata.Functions) {
        $cmdlets.AddRange($_.AdditionalMetadata.Functions.Split(" "))
    }
    $uri = "http://localhost:9200/ps/packages/$($_.AdditionalMetadata.GUID)"
    $data = @{
        'suggest-name' = @{
            input = @( $_.Name )
            weight = if($_.AdditionalMetadata.downloadCount) {$_.AdditionalMetadata.downloadCount} else {0}
        }
        'suggest-cmdlets' = @{
            input = $cmdlets
            weight = if($_.AdditionalMetadata.downloadCount) {$_.AdditionalMetadata.downloadCount} else {0}
        }
        'suggest-tags' = @{
            input = @(if($_.AdditionalMetadata.tags) {$_.AdditionalMetadata.tags.Split(" ")})
            weight = if($_.AdditionalMetadata.downloadCount) {$_.AdditionalMetadata.downloadCount} else {0}
        }
        'description' = $_.Description
    }
    Invoke-WebRequest -Uri $uri -Method "POST" -ContentType "application/json" -Body ($data | ConvertTo-Json)
}
```