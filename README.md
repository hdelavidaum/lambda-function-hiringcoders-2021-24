# AWS Serverless Application :man_technologist:

> Root Link: `https://i6328uam31.execute-api.us-east-2.amazonaws.com/prod`
>
> **All requests must be done with json body, when it is needed.**

## API Gateway Endpoints:

### GET /leads

-   request

```
no body
```

-   response

```json
{
  "Items": [
    {
      "userEmail": "formatacao_nova@email.com",
      "userType": "prospect",
      "clientSince": "",
      "lastModified": "2021-08-29T00:25:26.631Z",
      "createdAt": "2021-08-29T00:25:26.631Z",
      "id": "0ddc8e85-2676-4586-8890-d897fb186fe2",
      "phone": "+55(41)99999-1111",
      "name": "Fluxo Completo COm Response"
    },
    {
      "userEmail": "formatacao_nova@email.com",
      "userType": "client",
      "clientSince": "2021-08-29T00:36:27.981Z",
      "lastModified": "2021-08-29T00:36:27.981Z",
      "createdAt": "2021-08-29T00:36:27.981Z",
      "id": "f8c72086-7296-4b50-8a28-2e77ae3c68e3",
      "phone": "+55(41)99999-1111",
      "name": "Post Client"
    }
    ...
  ],
  "Count": 6,
  "ScannedCount": 6
}
```

### POST /leads

-   request
    -   These fields are required to create a lead:
        -   userEmail;
        -   phone;
        -   name;

```
{
    "userEmail": "teste@email.com",
    "phone": "+55(41)99999-1111",
    "name": "Post Client",
}
```

-   response

```json
{
    "message": "Lead created with ID 6a97ab86-436c-40c5-ab14-aa3d932474d4",
    "data": {
        "id": "6a97ab86-436c-40c5-ab14-aa3d932474d4"
    }
}
```

### GET /leads/{id}

-   request
    -   id must be sent at URL;

```
no body
```

-   response

```json
{
    "userEmail": "teste@email.com",
    "userType": "prospect",
    "clientSince": "",
    "lastModified": "2021-08-29T03:00:53.933Z",
    "createdAt": "2021-08-29T03:00:53.933Z",
    "id": "6a97ab86-436c-40c5-ab14-aa3d932474d4",
    "phone": "+55(41)99999-1111",
    "name": "Post Client"
}
```

### PATCH /leads/{id}

-   request
    -   id must be sent at URL;

```
{
	"userType": "client"
}
```

-   response

```json
{
    "message": "Lead ID 6a97ab86-436c-40c5-ab14-aa3d932474d4 has been updated this data: client",
    "data": {
        "userEmail": "teste@email.com",
        "userType": "client",
        "clientSince": "2021-08-29T03:08:30.605Z",
        "lastModified": "2021-08-29T03:08:30.605Z",
        "createdAt": "2021-08-29T03:00:53.933Z",
        "id": "6a97ab86-436c-40c5-ab14-aa3d932474d4",
        "name": "Post Client",
        "phone": "+55(41)99999-1111"
    }
}
```

### PATCH /leads/{id}

-   request
    -   id must be sent at URL;

```
no body
```

-   response

```json
{
    "message": "Lead ID 0e82c6db-ab49-476c-a813-8bb61ffa3913 has been permanently deleted from database.",
    "data": {
        "userEmail": "formatacao_nova@email.com",
        "userType": "client",
        "lastModified": "2021-08-29T00:14:17.144Z",
        "id": "0e82c6db-ab49-476c-a813-8bb61ffa3913",
        "name": "De novo Depois do Refactor",
        "phone": "+55(41)88888-7894"
    }
}
```
