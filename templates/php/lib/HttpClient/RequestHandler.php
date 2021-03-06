<?php

namespace {{call .Fnc.camelize .Pkg.Name}}\HttpClient;

use Guzzle\Http\Message\RequestInterface;

/**
 * RequestHandler takes care of encoding the request body into format given by options
 */
class RequestHandler {

    public static function setBody(RequestInterface $request, $body, $options)
    {
        $type = isset($options['request_type']) ? $options['request_type'] : '{{or .Api.Request.Formats.Default "raw"}}';
        $header = null;
{{if .Api.Request.Formats.Json}}
        // Encoding request body into JSON format
        if ($type == 'json') {
            $body = ((count($body) === 0) ? '{}' : json_encode($body, empty($body) ? JSON_FORCE_OBJECT : 0));
            return $request->setBody($body, 'application/json');
        }
{{end}}{{if .Api.Request.Formats.Form}}
        if ($type == 'form') {
            // Encoding body into form-urlencoded format
            return $request->addPostFields($body);
        }
{{end}}
        if ($type == 'raw') {
            // Raw body
            return $request->setBody($body, $header);
        }
    }

}
