import 'package:flutter/material.dart';

class RadarEffect extends StatefulWidget {
  final Color color;
  const RadarEffect({super.key, this.color = Colors.blue});

  @override
  State<RadarEffect> createState() => _RadarEffectState();
}

class _RadarEffectState extends State<RadarEffect> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      painter: _RadarPainter(_controller, widget.color),
      child: const SizedBox(
        width: double.infinity,
        height: double.infinity,
      ),
    );
  }
}

class _RadarPainter extends CustomPainter {
  final Animation<double> animation;
  final Color color;
  _RadarPainter(this.animation, this.color) : super(repaint: animation);

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final maxRadius = size.width / 1.5;
    
    final paint1 = Paint()
      ..color = color.withOpacity((1 - animation.value).clamp(0.0, 1.0))
      ..style = PaintingStyle.fill;

    canvas.drawCircle(center, maxRadius * animation.value, paint1);
    
    final delayedValue = animation.value - 0.4;
    if (delayedValue > 0) {
      final paint2 = Paint()
        ..color = color.withOpacity((1 - (delayedValue / 0.6)).clamp(0.0, 1.0) * 0.5)
        ..style = PaintingStyle.fill;
      canvas.drawCircle(center, maxRadius * (delayedValue / 0.6), paint2);
    }
  }

  @override
  bool shouldRepaint(_RadarPainter oldDelegate) => true;
}
