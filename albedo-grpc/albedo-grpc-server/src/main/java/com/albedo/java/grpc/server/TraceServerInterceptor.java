package com.albedo.java.grpc.server;

import org.springframework.cloud.sleuth.Span;
import org.springframework.cloud.sleuth.SpanExtractor;
import org.springframework.cloud.sleuth.Tracer;

import io.grpc.ForwardingServerCallListener;
import io.grpc.Metadata;
import io.grpc.ServerCall;
import io.grpc.ServerCallHandler;
import io.grpc.ServerInterceptor;
import lombok.extern.slf4j.Slf4j;

/**
 * User: Michael
 * Email: yidongnan@gmail.com
 * Date: 2016/12/8
 */
@Slf4j
public class TraceServerInterceptor implements ServerInterceptor {

    private Tracer tracer;
    private SpanExtractor<Metadata> spanExtractor;

    public TraceServerInterceptor(Tracer tracer, SpanExtractor<Metadata> spanExtractor) {
        this.tracer = tracer;
        this.spanExtractor = spanExtractor;
    }

    @SuppressWarnings("unchecked")
    @Override
    public <ReqT, RespT> ServerCall.Listener<ReqT> interceptCall(ServerCall<ReqT, RespT> call, Metadata headers, ServerCallHandler<ReqT, RespT> next) {
        Span span = spanExtractor.joinTrace(headers);
        this.tracer.continueSpan(span);

        final Span grpcSpan = this.tracer.createSpan("gRPC:" + call.getMethodDescriptor().getFullMethodName());
        final ServerCall.Listener<ReqT> original = next.startCall(call, headers);
        return new ForwardingServerCallListener.SimpleForwardingServerCallListener<ReqT>(original) {

            @Override
            public void onComplete() {
                tracer.close(grpcSpan);
                super.onComplete();
            }
        };
    }
}
