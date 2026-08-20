$ErrorActionPreference = "Stop"

# ============================================================
# Blood Donation Management System - Smoke Test
# ============================================================

$gateway = "http://localhost:8080"
$keycloak = "http://localhost:8180"
$authService = "http://localhost:8081"
$donationService = "http://localhost:8082"
$bloodBankService = "http://localhost:8083"

$results = New-Object System.Collections.Generic.List[Object]


# ============================================================
# Helper: Add test result
# ============================================================

function Add-Result {
    param(
        [string]$Name,
        [string]$Expected,
        $Actual,
        [bool]$Pass
    )

    $results.Add(
        [PSCustomObject]@{
            Test     = $Name
            Expected = $Expected
            Actual   = $Actual
            Status   = $(if ($Pass) { "PASS" } else { "FAIL" })
        }
    )
}


# ============================================================
# Helper: Send request and return HTTP status code
# ============================================================

function Invoke-Status {
    param(
        [string]$Method,
        [string]$Uri,
        [hashtable]$Headers = @{},
        [object]$Body = $null,
        [string]$ContentType = "application/json"
    )

    try {

        $params = @{
            Method      = $Method
            Uri         = $Uri
            Headers     = $Headers
            ErrorAction = "Stop"
        }

        # Add a request body ONLY when Body was actually supplied.
        # This prevents GET/DELETE requests from receiving an empty body.
        if ($PSBoundParameters.ContainsKey("Body") -and $null -ne $Body) {
            $params.Body = $Body
            $params.ContentType = $ContentType
        }

        $response = Invoke-WebRequest @params -UseBasicParsing

        return [int]$response.StatusCode
    }
    catch {

        if ($null -ne $_.Exception.Response) {

            try {
                return [int]$_.Exception.Response.StatusCode
            }
            catch {
                throw
            }
        }

        throw
    }
}


# ============================================================
# Helper: Send JSON request and return JSON response
# ============================================================

function Invoke-Json {
    param(
        [string]$Method,
        [string]$Uri,
        [hashtable]$Headers = @{},
        [object]$Body = $null
    )

    $params = @{
        Method      = $Method
        Uri         = $Uri
        Headers     = $Headers
        ContentType = "application/json"
        ErrorAction = "Stop"
    }

    if ($PSBoundParameters.ContainsKey("Body") -and $null -ne $Body) {
        $params.Body = ($Body | ConvertTo-Json -Depth 8)
    }

    return Invoke-RestMethod @params -UseBasicParsing
}


# ============================================================
# Start
# ============================================================

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host " Blood Donation Management System Smoke Test" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Make sure Docker Compose is already running." -ForegroundColor Yellow
Write-Host ""


# ============================================================
# 1. Service Health Checks
# ============================================================

Write-Host "[1] Checking services..." -ForegroundColor Cyan

$healthChecks = @(

    @{
        Name = "Auth health"
        Url  = "$authService/actuator/health"
    },

    @{
        Name = "Donation health"
        Url  = "$donationService/actuator/health"
    },

    @{
        Name = "Blood Bank health"
        Url  = "$bloodBankService/actuator/health"
    },

    @{
        Name = "Gateway health"
        Url  = "$gateway/actuator/health"
    }
)

foreach ($item in $healthChecks) {

    $status = Invoke-Status `
        -Method "GET" `
        -Uri $item.Url

    Add-Result `
        -Name $item.Name `
        -Expected "200" `
        -Actual $status `
        -Pass ($status -eq 200)
}


# ============================================================
# 2. Direct service should reject missing API key
# ============================================================

Write-Host "[2] Testing microservice API-key security..." -ForegroundColor Cyan

$status = Invoke-Status `
    -Method "GET" `
    -Uri "$authService/api/users"

Add-Result `
    -Name "Auth service without API key" `
    -Expected "401" `
    -Actual $status `
    -Pass ($status -eq 401)


# ============================================================
# 3. Gateway should reject request without OAuth token
# ============================================================

Write-Host "[3] Testing Gateway OAuth2 protection..." -ForegroundColor Cyan

$status = Invoke-Status `
    -Method "GET" `
    -Uri "$gateway/api/users"

Add-Result `
    -Name "Gateway without OAuth token" `
    -Expected "401" `
    -Actual $status `
    -Pass ($status -eq 401)


# ============================================================
# 4. Get OAuth2 access token from Keycloak
# ============================================================

Write-Host "[4] Obtaining Keycloak test token..." -ForegroundColor Cyan

try {

    $tokenResponse = Invoke-RestMethod `
        -Method POST `
        -Uri "$keycloak/realms/blood-donation/protocol/openid-connect/token" `
        -ContentType "application/x-www-form-urlencoded" `
        -Body @{
            grant_type = "password"
            client_id  = "blood-donation-test-client"
            username   = "admin1"
            password   = "admin123"
            scope      = "openid profile email"
        } `
        -UseBasicParsing `
        -ErrorAction Stop

    $token = $tokenResponse.access_token

    if (-not $token) {
        throw "Keycloak did not return an access token."
    }

    Write-Host "Keycloak token received successfully." -ForegroundColor Green
}
catch {

    Write-Host ""
    Write-Host "FAILED to obtain Keycloak token." -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

$bearer = @{
    Authorization = "Bearer $token"
}


# ============================================================
# 5. Test CORS
# ============================================================

Write-Host "[5] Testing Gateway CORS..." -ForegroundColor Cyan

$corsHeaders = @{
    Origin                           = "http://localhost:5173"
    "Access-Control-Request-Method"  = "GET"
    "Access-Control-Request-Headers" = "authorization,content-type"
}

$status = Invoke-Status `
    -Method "OPTIONS" `
    -Uri "$gateway/api/users" `
    -Headers $corsHeaders

Add-Result `
    -Name "Gateway CORS preflight" `
    -Expected "200/204" `
    -Actual $status `
    -Pass (($status -eq 200) -or ($status -eq 204))


# ============================================================
# Generate unique values
# ============================================================

$stamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()

$email = "smoke$stamp@example.com"

$tomorrow = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")

$today = (Get-Date).ToString("yyyy-MM-dd")


# ============================================================
# 6. Create User
# ============================================================

Write-Host "[6] Creating test user..." -ForegroundColor Cyan

try {

    $user = Invoke-Json `
        -Method "POST" `
        -Uri "$gateway/api/users" `
        -Headers $bearer `
        -Body @{
            name       = "Smoke Test Donor"
            email      = $email
            bloodGroup = "O+"
            phone      = "0712345678"
            city       = "Colombo"
            role       = "DONOR"
        }

    Add-Result `
        -Name "Create user through Gateway" `
        -Expected "User ID returned" `
        -Actual $user.id `
        -Pass ($null -ne $user.id)
}
catch {

    Add-Result `
        -Name "Create user through Gateway" `
        -Expected "User ID returned" `
        -Actual $_.Exception.Message `
        -Pass $false

    throw
}


# ============================================================
# 7. Test correct API key
# ============================================================

Write-Host "[7] Testing valid Auth Service API key..." -ForegroundColor Cyan

$status = Invoke-Status `
    -Method "GET" `
    -Uri "$authService/api/users" `
    -Headers @{
        "X-API-KEY" = "auth-service-secret-key"
    }

Add-Result `
    -Name "Auth service with valid API key" `
    -Expected "200" `
    -Actual $status `
    -Pass ($status -eq 200)


# ============================================================
# 8. Create Donation
# ============================================================

Write-Host "[8] Creating donation..." -ForegroundColor Cyan

$donation = Invoke-Json `
    -Method "POST" `
    -Uri "$gateway/api/donations" `
    -Headers $bearer `
    -Body @{
        donorId       = [int64]$user.id
        bloodGroup    = "O+"
        quantityMl    = 450
        location      = "Colombo"
        availableDate = $tomorrow
    }

Add-Result `
    -Name "Create donation" `
    -Expected "Donation ID returned" `
    -Actual $donation.id `
    -Pass ($null -ne $donation.id)


# ============================================================
# 9. Invalid Donation Validation
# ============================================================

Write-Host "[9] Testing invalid donation quantity..." -ForegroundColor Cyan

$invalidDonationBody = @{
    donorId       = [int64]$user.id
    bloodGroup    = "O+"
    quantityMl    = -1
    location      = "Colombo"
    availableDate = $tomorrow
} | ConvertTo-Json

$status = Invoke-Status `
    -Method "POST" `
    -Uri "$gateway/api/donations" `
    -Headers $bearer `
    -Body $invalidDonationBody

Add-Result `
    -Name "Reject invalid donation quantity" `
    -Expected "400" `
    -Actual $status `
    -Pass ($status -eq 400)


# ============================================================
# 10. Unknown Donation
# ============================================================

Write-Host "[10] Testing unknown donation ID..." -ForegroundColor Cyan

$status = Invoke-Status `
    -Method "GET" `
    -Uri "$gateway/api/donations/999999999" `
    -Headers $bearer

Add-Result `
    -Name "Unknown donation ID" `
    -Expected "404" `
    -Actual $status `
    -Pass ($status -eq 404)


# ============================================================
# 11. Create Blood Bank
# ============================================================

Write-Host "[11] Creating blood bank..." -ForegroundColor Cyan

$bank = Invoke-Json `
    -Method "POST" `
    -Uri "$gateway/api/bloodbanks" `
    -Headers $bearer `
    -Body @{
        name    = "Smoke Test Blood Bank"
        address = "100 Test Road"
        city    = "Colombo"
        phone   = "0112345678"
    }

Add-Result `
    -Name "Create blood bank" `
    -Expected "Blood bank ID returned" `
    -Actual $bank.id `
    -Pass ($null -ne $bank.id)


# ============================================================
# 12. Create Blood Stock
# ============================================================

Write-Host "[12] Creating blood stock..." -ForegroundColor Cyan

$stock = Invoke-Json `
    -Method "POST" `
    -Uri "$gateway/api/bloodstocks" `
    -Headers $bearer `
    -Body @{
        bloodBankId  = [int64]$bank.id
        bloodGroup   = "O+"
        quantityUnits = 5
    }

Add-Result `
    -Name "Create blood stock" `
    -Expected "Stock ID returned" `
    -Actual $stock.id `
    -Pass ($null -ne $stock.id)


# ============================================================
# 13. Create Blood Request
# ============================================================

Write-Host "[13] Creating blood request..." -ForegroundColor Cyan

$request = Invoke-Json `
    -Method "POST" `
    -Uri "$gateway/api/bloodrequests" `
    -Headers $bearer `
    -Body @{
        bloodBankId   = [int64]$bank.id
        bloodGroup    = "A+"
        quantityUnits = 2
        requestedDate = $today
    }

Add-Result `
    -Name "Create blood request" `
    -Expected "Request ID returned" `
    -Actual $request.id `
    -Pass ($null -ne $request.id)


# ============================================================
# 14. Update Donation Status
# ============================================================

Write-Host "[14] Updating donation status..." -ForegroundColor Cyan

$donationStatusBody = @{
    status = "RESERVED"
} | ConvertTo-Json

$status = Invoke-Status `
    -Method "PATCH" `
    -Uri "$gateway/api/donations/$($donation.id)/status" `
    -Headers $bearer `
    -Body $donationStatusBody

Add-Result `
    -Name "Update donation status" `
    -Expected "200" `
    -Actual $status `
    -Pass ($status -eq 200)


# ============================================================
# 15. Update Blood Request Status
# ============================================================

Write-Host "[15] Updating blood request status..." -ForegroundColor Cyan

$requestStatusBody = @{
    status = "APPROVED"
} | ConvertTo-Json

$status = Invoke-Status `
    -Method "PATCH" `
    -Uri "$gateway/api/bloodrequests/$($request.id)/status" `
    -Headers $bearer `
    -Body $requestStatusBody

Add-Result `
    -Name "Update blood request status" `
    -Expected "200" `
    -Actual $status `
    -Pass ($status -eq 200)


# ============================================================
# 16. Redis Rate Limiting
# ============================================================

Write-Host ""
Write-Host "[16] Testing Redis rate limiting..." -ForegroundColor Cyan
Write-Host "Waiting 11 seconds for a fresh rate-limit window..." -ForegroundColor DarkGray

Start-Sleep -Seconds 11

$codes = @()

for ($i = 1; $i -le 25; $i++) {

    $code = Invoke-Status `
        -Method "GET" `
        -Uri "$gateway/api/users" `
        -Headers $bearer

    $codes += $code
}

$has429 = $codes -contains 429

$rateSummary = (
    $codes |
    Group-Object |
    ForEach-Object {
        "$($_.Name):$($_.Count)"
    }
) -join ", "

Add-Result `
    -Name "Redis rate limiting" `
    -Expected "At least one HTTP 429" `
    -Actual $rateSummary `
    -Pass $has429


# ============================================================
# Wait before cleanup
# ============================================================

Write-Host "Waiting 11 seconds before cleanup..." -ForegroundColor DarkGray

Start-Sleep -Seconds 11


# ============================================================
# 17. Cleanup / DELETE Tests
# ============================================================

Write-Host "[17] Testing DELETE endpoints..." -ForegroundColor Cyan

$cleanup = @(

    @{
        Name = "Delete blood request"
        Url  = "$gateway/api/bloodrequests/$($request.id)"
    },

    @{
        Name = "Delete blood stock"
        Url  = "$gateway/api/bloodstocks/$($stock.id)"
    },

    @{
        Name = "Delete blood bank"
        Url  = "$gateway/api/bloodbanks/$($bank.id)"
    },

    @{
        Name = "Delete donation"
        Url  = "$gateway/api/donations/$($donation.id)"
    },

    @{
        Name = "Delete user as admin"
        Url  = "$gateway/api/users/$($user.id)"
    }
)

foreach ($item in $cleanup) {

    $status = Invoke-Status `
        -Method "DELETE" `
        -Uri $item.Url `
        -Headers $bearer

    Add-Result `
        -Name $item.Name `
        -Expected "204" `
        -Actual $status `
        -Pass ($status -eq 204)
}


# ============================================================
# Final Results
# ============================================================

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "               TEST RESULTS                  " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$results | Format-Table -AutoSize

$failed = @(
    $results |
    Where-Object {
        $_.Status -eq "FAIL"
    }
).Count

$passed = @(
    $results |
    Where-Object {
        $_.Status -eq "PASS"
    }
).Count

Write-Host ""
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })

if ($failed -gt 0) {

    Write-Host ""
    Write-Host "$failed test(s) failed." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "All smoke tests passed successfully." -ForegroundColor Green
exit 0